import { Module } from "@nestjs/common";
import { FormsController } from "./forms.controller";
import { FormsService } from "./forms.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  ActaForm,
  AdmissionForm,
  Document,
  FormEntity,
  PlanForm,
  SemestralReportForm,
} from "@/entities";
import { FormFactory } from "@/factory/form.factory";
import { PrinterModule } from "../printer/printer.module";
import { StorageModule } from "../storage/storage.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FormEntity,
      AdmissionForm,
      PlanForm,
      SemestralReportForm,
      ActaForm,
      Document,
    ]),
    PrinterModule,
    StorageModule,
    AuthModule,
  ],
  controllers: [FormsController],
  providers: [FormsService, FormFactory],
})
export class FormsModule {}
