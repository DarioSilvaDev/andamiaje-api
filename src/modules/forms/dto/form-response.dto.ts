import { FORMTYPE, UserRole } from "@/commons/enums";

export enum FormReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface FormUserSnapshotDto {
  id: number;
  fullName: string;
  role: UserRole | null;
}

export interface FormBaseDataDto {
  patient: string | null;
  documentNumber: string;
  age: number | null;
  birthDate: Date | null;
  diagnosis: string | null;
  fecha: Date;
}

export interface FormReviewDto {
  status: FormReviewStatus;
  approved: boolean | null;
  rejectionReason: string | null;
  fileUrl: string | null;
  reviewedAt: Date | null;
}

export interface FormResponseDto {
  id: number;
  type: FORMTYPE;
  baseData: FormBaseDataDto;
  specificData: Record<string, any> | null;
  createdBy: FormUserSnapshotDto;
  approvedBy: FormUserSnapshotDto | null;
  review: FormReviewDto;
  createdAt: Date;
  updatedAt: Date;
}
