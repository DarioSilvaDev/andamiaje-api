import { ActaForm } from "@/entities/acta.form.entity";
import { AdmissionForm } from "@/entities/admissions.entity";
import { FormEntity } from "@/entities/form.entity";
import { PlanForm } from "@/entities/planForm.entity";
import { SemestralReportForm } from "@/entities/semestral_reports.entity";
import { FormFactory } from "@/factory/form.factory";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FORMTYPE } from "../../commons/enums";

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(FormEntity)
    private readonly formRepository: Repository<FormEntity>,
    @InjectRepository(AdmissionForm)
    private readonly admissionRepository: Repository<AdmissionForm>,
    @InjectRepository(PlanForm)
    private readonly planRepository: Repository<PlanForm>,
    @InjectRepository(SemestralReportForm)
    private readonly semestralRepository: Repository<SemestralReportForm>,
    @InjectRepository(ActaForm)
    private readonly actaRepository: Repository<ActaForm>,
    private readonly formFactory: FormFactory
  ) {}

  async create(type: FORMTYPE, baseData, specificData: any) {
    const { form, child } = this.formFactory.createForm(
      type,
      baseData,
      specificData
    );

    const savedForm = await this.formRepository.save(form);

    switch (type) {
      case FORMTYPE.INFORME_ADMISION:
        child.form = savedForm;
        return this.admissionRepository.save(child);
      case FORMTYPE.PLAN_TRABAJO:
        child.form = savedForm;
        return this.planRepository.save(child);
      case FORMTYPE.INFORME_SEMESTRAL:
        child.form = savedForm;
        return this.semestralRepository.save(child);
      case FORMTYPE.ACTAS:
        child.form = savedForm;
        return this.actaRepository.save(child);
      default:
        throw new Error(`Unsupported form type: ${type}`);
    }
  }

  async getPendings() {
    return this.actaRepository.find({
      relations: ["form", "form.createdBy"],
      select: {
        form: {
          createdBy: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            accountStatus: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }
}
