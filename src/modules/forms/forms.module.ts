import { Module } from "@nestjs/common";
import { FormsController } from "./forms.controller";
import { FormsService } from "./forms.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  ActaForm,
  AdmissionForm,
  FormEntity,
  PlanForm,
  SemestralReportForm,
} from "@/entities";
import { FormFactory } from "@/factory/form.factory";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FormEntity,
      AdmissionForm,
      PlanForm,
      SemestralReportForm,
      ActaForm,
    ]),
  ],
  controllers: [FormsController],
  providers: [FormsService, FormFactory],
})
export class FormsModule {}
