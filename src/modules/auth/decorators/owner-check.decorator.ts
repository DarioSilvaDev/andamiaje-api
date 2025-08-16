import { SetMetadata } from '@nestjs/common';
import { OwnerCheck as OwnerCheckInterface } from '../guards/owner.guard';

export const OWNER_CHECK_KEY = 'ownerCheck';
export const OwnerCheck = (ownerCheck: OwnerCheckInterface) => SetMetadata(OWNER_CHECK_KEY, ownerCheck); 