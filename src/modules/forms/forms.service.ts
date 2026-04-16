import { ActaForm } from "@/entities/acta.form.entity";
import { AdmissionForm } from "@/entities/admissions.entity";
import { Document } from "@/entities/document.entity";
import { FormEntity } from "@/entities/form.entity";
import { PlanForm } from "@/entities/planForm.entity";
import { SemestralReportForm } from "@/entities/semestral_reports.entity";
import { FormFactory } from "@/factory/form.factory";
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FORMTYPE, UserRole } from "../../commons/enums";
import { User } from "@/entities";
import { ReviewFormDto } from "./dto/review-form.dto";
import { PrinterService } from "../printer/printer.service";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { buildActa } from "../pdfReports/actas.pdf.builder";
import { StorageService } from "../storage/storage.service";

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
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly printerService: PrinterService,
    private readonly storageService: StorageService,
    private readonly formFactory: FormFactory,
  ) {}

  async create(type: FORMTYPE, baseData, specificData: any) {
    const { form, child } = this.formFactory.createForm(
      type,
      baseData,
      specificData,
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
    const forms = await this.formRepository.find({
      relations: ["createdBy", "approvedBy"],
      order: { createdAt: "DESC" },
    });

    const documents = await this.documentRepository.find({
      relations: ["form"],
    });

    const approvedFormIds = new Set(
      documents
        .filter((document) => document.approved)
        .map((doc) => doc.form?.id),
    );

    return forms.filter((form) => !approvedFormIds.has(form.id));
  }

  async getFormsByUser(user: User) {
    if (user.role === UserRole.DIRECTOR) {
      return this.formRepository.find({
        relations: ["createdBy", "approvedBy"],
        order: { createdAt: "DESC" },
      });
    }

    return this.formRepository.find({
      where: { createdBy: { id: user.id } },
      relations: ["createdBy", "approvedBy"],
      order: { createdAt: "DESC" },
    });
  }

  async getById(id: number): Promise<FormEntity> {
    const form = await this.formRepository.findOne({
      where: { id },
      relations: ["createdBy", "approvedBy"],
    });

    if (!form) {
      throw new NotFoundException("Formulario no encontrado");
    }

    return form;
  }

  async reviewForm(
    formId: number,
    reviewDto: ReviewFormDto,
    reviewer: User,
  ): Promise<Document> {
    if (reviewer.role !== UserRole.DIRECTOR) {
      throw new ForbiddenException(
        "Solo directores pueden aprobar o rechazar formularios",
      );
    }

    const form = await this.getById(formId);

    let document = await this.documentRepository.findOne({
      where: { form: { id: form.id } },
      relations: ["form", "createdBy", "approvedBy"],
    });

    if (!document) {
      document = this.documentRepository.create({
        form,
        createdBy: form.createdBy,
        approved: false,
        fileUrl: null,
        rejectionReason: null,
      });
    }

    document.approvedBy = reviewer;

    if (!reviewDto.approved) {
      document.approved = false;
      document.fileUrl = null;
      document.rejectionReason =
        reviewDto.rejectionReason || reviewDto.notes || null;
      return this.documentRepository.save(document);
    }

    const pdfDefinition = await this.buildPdfDefinition(form);
    const pdfBuffer = await this.printerService.createPdfBuffer(pdfDefinition);

    const pdfKey = `documents/${form.type}/${form.createdBy.documentNumber}-${form.id}-${Date.now()}.pdf`;
    const uploadedKey = await this.storageService.uploadBuffer(
      pdfKey,
      pdfBuffer,
    );

    document.approved = true;
    document.fileUrl = uploadedKey;
    document.rejectionReason = null;
    form.approvedBy = reviewer;
    await this.formRepository.save(form);

    return this.documentRepository.save(document);
  }

  private async buildPdfDefinition(
    form: FormEntity,
  ): Promise<TDocumentDefinitions> {
    if (form.type === FORMTYPE.ACTAS) {
      const acta = await this.actaRepository.findOne({
        where: { form: { id: form.id } },
        relations: ["form", "form.createdBy"],
      });

      if (acta) {
        return buildActa(
          {
            ...acta,
            createdBy: form.createdBy.fullName,
            patient: form.patient,
            date: form.fecha,
          },
          {},
        );
      }
    }

    return {
      content: [
        { text: "Documento aprobado", style: "title" },
        {
          text: `Formulario #${form.id} (${form.type})`,
          margin: [0, 10, 0, 0],
        },
        {
          text: `Paciente: ${form.patient || "Sin dato"}`,
          margin: [0, 5, 0, 0],
        },
        {
          text: `Profesional: ${form.createdBy?.fullName || "Sin dato"}`,
          margin: [0, 5, 0, 0],
        },
      ],
      styles: {
        title: {
          fontSize: 16,
          bold: true,
        },
      },
      defaultStyle: {
        font: "Roboto",
      },
    };
  }
}
