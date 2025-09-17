import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserRepository } from "@/repositories/user.repository";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { AuthorizationService } from "./services/authorization.service";
import { RolesGuard } from "./guards/roles.guard";
import { AuthRolesGuard } from "./guards/auth-roles.guard";
import { OwnerGuard } from "./guards/owner.guard";
import { AuthLoggingInterceptor } from "./interceptors/auth-logging.interceptor";
import { envs } from "@/config/envs";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LocalStrategy } from "./strategies/local.strategy";
import { User } from "@/entities";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      secret: envs.JWT_SECRET,
      signOptions: { expiresIn: envs.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    AuthorizationService,
    // Guards
    JwtAuthGuard,
    RolesGuard,
    AuthRolesGuard,
    OwnerGuard,
    // Interceptors
    AuthLoggingInterceptor,
    // Repositories
    UserRepository,
  ],
  exports: [
    AuthService,
    AuthorizationService,
    RolesGuard,
    AuthRolesGuard,
    OwnerGuard,
    AuthLoggingInterceptor,
  ],
})
export class AuthModule {}
