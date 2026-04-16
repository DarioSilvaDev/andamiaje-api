import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { User } from "@/entities/user.entity";
import { UserRepository } from "@/repositories/user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AccountStatus, UserRole } from "@/commons/enums";
import { ReviewUserDto } from "./dto/review-user.dto";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...createUserDto,
      accountStatus: AccountStatus.PENDING_SIGNATURE,
      firstLogin: true,
      rejectionReason: null,
    });
    return this.usersRepository.save(user);
  }

  async findAll(currentUser: User): Promise<User[]> {
    if (currentUser.role === UserRole.DIRECTOR) {
      return this.usersRepository.findAll();
    }

    const ownUser = await this.usersRepository.findOneById(currentUser.id);
    return ownUser ? [ownUser] : [];
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<void> {
    const userToUpdate = await this.usersRepository.findOneById(id);

    if (!userToUpdate) {
      throw new NotFoundException("Usuario no encontrado");
    }

    const isDirector = currentUser.role === UserRole.DIRECTOR;
    const isOwner = currentUser.id === id;

    if (!isDirector && !isOwner) {
      throw new ForbiddenException("No puedes modificar este usuario");
    }

    const protectedFields: (keyof UpdateUserDto)[] = [
      "role",
      "accountStatus",
      "documentNumber",
    ];

    if (!isDirector) {
      for (const field of protectedFields) {
        if (updateUserDto[field] !== undefined) {
          throw new ForbiddenException(
            "No tienes permisos para actualizar campos críticos",
          );
        }
      }
    }

    await this.usersRepository.updateUser(id, updateUserDto as Partial<User>);
    return;
  }

  // async uploadDigitalSignature(
  //   user: User,
  //   digitalSignature: Express.Multer.File
  // ): Promise<AccountStatus> {
  //   const response = await this.usersRepository.update(user.id, {
  //     digitalSignature: digitalSignature.path,
  //     accountStatus: AccountStatus.ACTIVE,
  //   });
  //   return response.affected ? AccountStatus.ACTIVE : user.accountStatus;
  // }

  async remove(id: number, currentUser: User): Promise<void> {
    const isDirector = currentUser.role === UserRole.DIRECTOR;
    const isOwner = currentUser.id === id;

    if (!isDirector && !isOwner) {
      throw new ForbiddenException("No puedes desactivar este usuario");
    }

    return this.usersRepository.deactivateUser(id);
  }

  findPendingApprovals(currentUser: User): Promise<User[]> {
    if (currentUser.role !== UserRole.DIRECTOR) {
      throw new ForbiddenException("Solo directores pueden ver pendientes");
    }

    return this.usersRepository.findPendingApprovalUsers();
  }

  async reviewPendingUser(
    id: number,
    dto: ReviewUserDto,
    reviewer: User,
  ): Promise<User> {
    if (reviewer.role !== UserRole.DIRECTOR) {
      throw new ForbiddenException("Solo directores pueden revisar usuarios");
    }

    const user = await this.usersRepository.findOneById(id);

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    if (user.accountStatus !== AccountStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        "El usuario no está en estado pendiente de aprobación",
      );
    }

    if (dto.approved) {
      if (!dto.role) {
        throw new BadRequestException("Debes indicar un rol al aprobar");
      }

      user.role = dto.role;
      user.accountStatus = AccountStatus.PENDING_SIGNATURE;
      user.rejectionReason = null;

      const approvedUser = await this.usersRepository.save(user);
      await this.notificationsService.sendWelcomeEmail(approvedUser);
      return approvedUser;
    }

    user.accountStatus = AccountStatus.REJECTED;
    user.rejectionReason = dto.rejectionReason || dto.notes || "Sin detalle";
    user.refreshTokenHash = null;

    return this.usersRepository.save(user);
  }
}
