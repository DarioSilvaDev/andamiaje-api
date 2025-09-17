import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

// local.strategy.ts
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: "documentNumber" }); // Usa 'username' y 'password' por defecto
  }

  async validate(documentNumber: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(documentNumber, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
