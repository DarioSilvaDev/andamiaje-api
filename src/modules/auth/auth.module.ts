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

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
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
    AuthorizationService,
    // Guards
    JwtAuthGuard,
    RolesGuard,
    AuthRolesGuard,
    OwnerGuard,
    // Interceptors
    AuthLoggingInterceptor,
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
