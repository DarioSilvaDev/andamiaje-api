import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { envs } from "@/config/envs";
import { UserValidateDto } from "../dto/user-validated.dto";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.accessToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: envs.JWT_SECRET,
    });
  }

  async validate(payload: UserValidateDto) {
    return {
      id: payload.id,
      documentNumber: payload.documentNumber,
      accountStatus: payload.accountStatus,
      email: payload.email,
      role: payload.role,
      firstLogin: payload.firstLogin,
      hasSignature: payload.hasSignature,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
    };
  }
}
