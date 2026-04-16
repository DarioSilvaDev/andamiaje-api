import { AccountStatus, UserRole } from "@/commons/enums";

export class UserValidateDto {
  sub: number;
  id?: number;
  documentNumber: string;
  accountStatus: AccountStatus;
  email: string;
  role: UserRole | null;
  firstLogin: boolean;
  hasSignature: boolean;
  firstName: string;
  lastName: string;
  phone: string;
}
