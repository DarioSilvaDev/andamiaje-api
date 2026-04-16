import { Module } from "@nestjs/common";
import { FormsController } from "./forms.controller";
import { FormsService } from "./forms.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  ActaForm,
  AdmissionForm,
  CompanionFollowupForm,
  Document,
  FamilyFollowupForm,
  FormEntity,
  FormReviewAudit,
  InvoiceForm,
  MonthlyReportForm,
  PlanForm,
  SemestralReportForm,
} from "@/entities";
import { FormFactory } from "@/factory/form.factory";
import { PrinterModule } from "../printer/printer.module";
import { StorageModule } from "../storage/storage.module";
import { AuthModule } from "../auth/auth.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FormEntity,
      AdmissionForm,
      PlanForm,
      SemestralReportForm,
      ActaForm,
      MonthlyReportForm,
      CompanionFollowupForm,
      FamilyFollowupForm,
      InvoiceForm,
      Document,
      FormReviewAudit,
    ]),
    PrinterModule,
    StorageModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [FormsController],
  providers: [FormsService, FormFactory],
})
export class FormsModule {}
