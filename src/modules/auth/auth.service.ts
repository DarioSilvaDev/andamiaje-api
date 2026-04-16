import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "@/repositories/user.repository";
import { User } from "@/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { envs } from "@/config/envs";
import { RegisterDto } from "./dto/register.dto";
import { AccountStatus, UserRole } from "@/commons/enums";
import { UserValidateDto } from "./dto/user-validated.dto";
import * as bcrypt from "bcryptjs";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async validateUser(documentNumber: string, password: string): Promise<User> {
    const user = await this.userRepository.findByDocumentNumber(documentNumber);

    if (!user) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    if (user.accountStatus === AccountStatus.PENDING_APPROVAL) {
      throw new UnauthorizedException(
        "Tu cuenta se encuentra pendiente de aprobación",
      );
    }

    if (user.accountStatus === AccountStatus.REJECTED) {
      throw new UnauthorizedException(
        "Tu solicitud fue rechazada. Debes reenviar la solicitud",
      );
    }

    if (user.accountStatus === AccountStatus.DISABLED) {
      throw new UnauthorizedException("Usuario deshabilitado.");
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(
      loginDto.documentNumber,
      loginDto.password,
    );

    if (!user.role) {
      throw new UnauthorizedException(
        "Tu cuenta aún no tiene rol asignado por un director",
      );
    }

    const payload = this.buildPayload(user);
    const { accessToken, refreshToken } = this.generateTokens(payload);

    await this.persistRefreshToken(user.id, refreshToken);

    await this.userRepository.updateLastLogin(user.id);

    return this.createAuthResponse(user, accessToken, refreshToken);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: envs.JWT_REFRESH_SECRET,
      });

      const userId = payload.sub ?? payload.id;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (
        !user ||
        [
          AccountStatus.PENDING_APPROVAL,
          AccountStatus.REJECTED,
          AccountStatus.DISABLED,
        ].includes(user.accountStatus)
      ) {
        throw new UnauthorizedException("Usuario no encontrado");
      }

      if (!user.refreshTokenHash) {
        throw new UnauthorizedException("Sesión inválida");
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash,
      );

      if (!isRefreshTokenValid) {
        await this.userRepository.update(user.id, { refreshTokenHash: null });
        throw new UnauthorizedException("Refresh token inválido");
      }

      if (!user.role) {
        throw new UnauthorizedException(
          "Tu cuenta aún no tiene rol asignado por un director",
        );
      }

      const newPayload = this.buildPayload(user);
      const tokens = this.generateTokens(newPayload);
      await this.persistRefreshToken(user.id, tokens.refreshToken);

      return this.createAuthResponse(
        user,
        tokens.accessToken,
        tokens.refreshToken,
      );
    } catch (error) {
      throw new UnauthorizedException("Token de refresco inválido");
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, { secret: envs.JWT_SECRET });
    } catch (error) {
      throw new UnauthorizedException("Token inválido");
    }
  }

  private getExpirationTime(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 24 * 60 * 60;
      default:
        return 86400; // 24 horas por defecto
    }
  }

  async logout(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("Usuario no encontrado");
    }

    await this.userRepository.update(user.id, { refreshTokenHash: null });
  }

  async getUserProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, accountStatus: AccountStatus.ACTIVE },
    });

    if (!user) {
      throw new UnauthorizedException("Usuario no encontrado o inactivo");
    }

    return user;
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.userRepository.updateLastLogin(userId);
  }

  async register(
    userData: RegisterDto,
  ): Promise<{ message: string; status: AccountStatus }> {
    const existingUser = await this.userRepository
      .createQueryBuilder("user")
      .where("user.documentNumber = :documentNumber", {
        documentNumber: userData.documentNumber,
      })
      .orWhere("user.email = :email", { email: userData.email })
      .getOne();

    if (existingUser) {
      if (existingUser.accountStatus === AccountStatus.REJECTED) {
        throw new BadRequestException(
          "Tu solicitud fue rechazada. Usa el endpoint de reaplicación",
        );
      }

      throw new ConflictException(
        "Ya existe un usuario registrado con ese documento o email",
      );
    }

    const user = this.userRepository.create({
      ...userData,
      role: null,
      accountStatus: AccountStatus.PENDING_APPROVAL,
      firstLogin: true,
      digitalSignature: null,
      refreshTokenHash: null,
      rejectionReason: null,
    });

    const savedUser = await this.userRepository.save(user);
    await this.notifyDirectorsNewRequest(savedUser);

    return {
      message: "Solicitud de registro enviada. Pendiente de aprobación",
      status: AccountStatus.PENDING_APPROVAL,
    };
  }

  async reapply(
    userData: RegisterDto,
  ): Promise<{ message: string; status: AccountStatus }> {
    const existingUser = await this.userRepository
      .createQueryBuilder("user")
      .where("user.documentNumber = :documentNumber", {
        documentNumber: userData.documentNumber,
      })
      .orWhere("user.email = :email", { email: userData.email })
      .getOne();

    if (
      !existingUser ||
      existingUser.accountStatus !== AccountStatus.REJECTED
    ) {
      throw new BadRequestException(
        "No hay una solicitud rechazada para reaplicar",
      );
    }

    existingUser.firstName = userData.firstName;
    existingUser.lastName = userData.lastName;
    existingUser.email = userData.email;
    existingUser.phone = userData.phone;
    existingUser.documentNumber = userData.documentNumber;
    existingUser.password = userData.password;
    existingUser.role = null;
    existingUser.accountStatus = AccountStatus.PENDING_APPROVAL;
    existingUser.refreshTokenHash = null;
    existingUser.rejectionReason = null;
    existingUser.digitalSignature = null;
    existingUser.firstLogin = true;

    const savedUser = await this.userRepository.save(existingUser);
    await this.notifyDirectorsNewRequest(savedUser);

    return {
      message: "Solicitud reenviada para revisión",
      status: AccountStatus.PENDING_APPROVAL,
    };
  }

  private buildPayload(user: User): UserValidateDto {
    return {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      documentNumber: user.documentNumber,
      firstLogin: !!user.firstLogin,
      hasSignature: !!user.digitalSignature,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };
  }

  private generateTokens(payload: UserValidateDto) {
    const accessToken = this.jwtService.sign(payload, {
      secret: envs.JWT_SECRET,
      expiresIn: envs.JWT_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: envs.JWT_REFRESH_SECRET,
      expiresIn: envs.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, { refreshTokenHash });
  }

  private createAuthResponse(
    user: User,
    accessToken: string,
    refreshToken: string,
  ): AuthResponseDto {
    const expiresIn = this.getExpirationTime(envs.JWT_EXPIRES_IN);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      },
      expiresIn,
    };
  }

  private async notifyDirectorsNewRequest(user: User): Promise<void> {
    const directors = await this.userRepository.findByRole(UserRole.DIRECTOR);

    await this.notificationsService.notifyDirectorsNewRegistration(
      directors,
      user,
    );
  }
}
