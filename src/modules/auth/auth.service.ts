import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "@/repositories/user.repository";
import { User } from "@/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { envs } from "@/config/envs";
import { RegisterDto } from "./dto/register.dto";
import { AccountStatus } from "@/commons/enums";
import { UserValidateDto } from "./dto/user-validated.dto";

@Injectable()
export class AuthService {
  constructor(
    // @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
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

    if (user.accountStatus === "DISABLED") {
      throw new UnauthorizedException("Usuario deshabilitado.");
    }

    console.log("🚀 ~ AuthService ~ validateUser ~ user:", user);
    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(
      loginDto.documentNumber,
      loginDto.password
    );

    const payload: UserValidateDto = {
      id: user.id,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      documentNumber: user.documentNumber,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: envs.JWT_SECRET,
      expiresIn: envs.JWT_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: envs.JWT_REFRESH_SECRET,
      expiresIn: envs.JWT_REFRESH_EXPIRES_IN,
    });

    await this.userRepository.updateLastLogin(user.id);

    // Calcular tiempo de expiración en segundos
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

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: envs.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, accountStatus: AccountStatus.ACTIVE },
      });

      if (!user) {
        throw new UnauthorizedException("Usuario no encontrado");
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: envs.JWT_SECRET,
        expiresIn: envs.JWT_EXPIRES_IN,
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: envs.JWT_REFRESH_SECRET,
        expiresIn: envs.JWT_REFRESH_EXPIRES_IN,
      });

      const expiresIn = this.getExpirationTime(envs.JWT_EXPIRES_IN);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
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

    // Aquí podrías implementar lógica adicional para manejar el logout, como invalidar tokens
    // o registrar la acción en un log.
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

  async register(userData: RegisterDto): Promise<AuthResponseDto> {
    const user = this.userRepository.create(userData);
    const saved = await this.userRepository.save(user);
    console.log("🚀 ~ AuthService ~ register ~ saved:", saved);
    return this.login({
      documentNumber: userData.documentNumber,
      password: userData.password,
    });
  }
}
