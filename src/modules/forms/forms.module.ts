import { Module } from "@nestjs/common";
import { FormsController } from "./forms.controller";
import { FormsService } from "./forms.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  BaseForm,
  FormAuditLog,
  FormNotification,
  ActaFormV2,
  AdmissionFormV2,
  PlanFormV2,
  SemestralReportFormV2,
  MonthlyReportFormV2,
  AccompanimentFollowUpFormV2,
  FamilyFollowUpFormV2,
  InvoiceFormV2,
  User,
} from "@/entities";
import { FormFactoryV2 } from "@/factory/form-factory-v2";
import { WorkflowController } from "./controllers/workflow.controller";
import { WorkflowService } from "./services/workflow.service";
import { NotificationService } from "./services/notification.service";
import { PrinterModule } from "../printer/printer.module";
import { EmailModule } from "../email/email.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Entidades v2
      BaseForm,
      FormAuditLog,
      FormNotification,
      ActaFormV2,
      AdmissionFormV2,
      PlanFormV2,
      SemestralReportFormV2,
      MonthlyReportFormV2,
      AccompanimentFollowUpFormV2,
      FamilyFollowUpFormV2,
      InvoiceFormV2,
      User,
    ]),
    AuthModule, // Importar módulo de Auth (guards, strategies)
    PrinterModule, // Importar módulo de PDF
    EmailModule, // Importar módulo de Email
  ],
  controllers: [FormsController, WorkflowController],
  providers: [
    FormsService,
    FormFactoryV2,
    WorkflowService,
    NotificationService,
  ],
  exports: [FormsService, WorkflowService, NotificationService, FormFactoryV2],
})
export class FormsModule {}
