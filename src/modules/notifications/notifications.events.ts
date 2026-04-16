export const NOTIFICATION_EVENTS = {
  USER_REGISTRATION_REQUESTED: "notification.user.registration-requested",
  USER_APPROVED: "notification.user.approved",
  FORM_REVIEWED: "notification.form.reviewed",
} as const;

export interface NewUserRegistrationPayload {
  userId: number;
  fullName: string;
  documentNumber: string;
  email: string;
  recipientEmails: string[];
}

export interface UserApprovedPayload {
  userId: number;
  fullName: string;
  role: string | null;
  recipientEmail: string;
}

export interface FormReviewedPayload {
  formId: number;
  formType: string;
  approved: boolean;
  rejectionReason: string | null;
  fileUrl: string | null;
  reviewerId: number;
  recipientEmail: string;
}
