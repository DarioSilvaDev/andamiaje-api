import { SetMetadata } from "@nestjs/common";

export const ALLOW_PENDING_SIGNATURE_KEY = "allowPendingSignature";

export const AllowPendingSignature = () =>
  SetMetadata(ALLOW_PENDING_SIGNATURE_KEY, true);
