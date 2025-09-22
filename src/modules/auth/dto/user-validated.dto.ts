import { AccountStatus, UserRole } from "@/commons/enums";

export class UserValidateDto {
  id: number;
  documentNumber: string;
  accountStatus: AccountStatus;
  email: string;
  role: UserRole;
  firstLogin: boolean;
  hasSignature: boolean;
}
