import { ActaForm } from "@/entities/acta.form.entity";
import { AdmissionForm } from "@/entities/admissions.entity";
import { Document } from "@/entities/document.entity";
import { FormEntity } from "@/entities/form.entity";
import { PlanForm } from "@/entities/planForm.entity";
import { SemestralReportForm } from "@/entities/semestral_reports.entity";
import { FormFactory } from "@/factory/form.factory";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { FORMTYPE, UserRole } from "../../commons/enums";
import { User } from "@/entities";
import { ReviewFormDto } from "./dto/review-form.dto";
import { PrinterService } from "../printer/printer.service";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { buildActa } from "../pdfReports/actas.pdf.builder";
import { StorageService } from "../storage/storage.service";
import {
  FormResponseDto,
  FormReviewStatus,
  FormUserSnapshotDto,
} from "./dto/form-response.dto";

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

  async create(
    type: FORMTYPE,
    baseData: Record<string, any>,
    specificData: Record<string, any>,
  ): Promise<FormResponseDto> {
    const normalizedBaseData = this.normalizeBaseData(baseData);
    const normalizedSpecificData = this.normalizeSpecificData(
      type,
      specificData,
      normalizedBaseData.createdBy,
    );

    const { form, child } = this.formFactory.createForm(
      type,
      normalizedBaseData,
      normalizedSpecificData,
    );

    const savedForm = await this.formRepository.save(form);
    child.form = savedForm;

    await this.saveSpecificForm(type, child);

    return this.getById(savedForm.id);
  }

  async getPendings(): Promise<FormResponseDto[]> {
    const forms = await this.formRepository.find({
      relations: ["createdBy", "approvedBy"],
      order: { createdAt: "DESC" },
    });

    const documentsMap = await this.findDocumentsByFormIds(
      forms.map((form) => form.id),
    );

    const pendingForms = forms.filter((form) => {
      const document = documentsMap.get(form.id);
      return !document?.approved;
    });

    return Promise.all(
      pendingForms.map((form) =>
        this.buildFormResponse(form, documentsMap.get(form.id) || null),
      ),
    );
  }

  async getFormsByUser(user: User): Promise<FormResponseDto[]> {
    const forms =
      user.role === UserRole.DIRECTOR
        ? await this.formRepository.find({
            relations: ["createdBy", "approvedBy"],
            order: { createdAt: "DESC" },
          })
        : await this.formRepository.find({
            where: { createdBy: { id: user.id } },
            relations: ["createdBy", "approvedBy"],
            order: { createdAt: "DESC" },
          });

    const documentsMap = await this.findDocumentsByFormIds(
      forms.map((form) => form.id),
    );

    return Promise.all(
      forms.map((form) =>
        this.buildFormResponse(form, documentsMap.get(form.id) || null),
      ),
    );
  }

  async getById(id: number): Promise<FormResponseDto> {
    const form = await this.getFormEntityById(id);

    const document = await this.documentRepository.findOne({
      where: { form: { id } },
      relations: ["form"],
      order: { updatedAt: "DESC" },
    });

    return this.buildFormResponse(form, document || null);
  }

  async reviewForm(
    formId: number,
    reviewDto: ReviewFormDto,
    reviewer: User,
  ): Promise<FormResponseDto> {
    const form = await this.getFormEntityById(formId);
    const reviewerRef = { id: reviewer.id } as User;

    let uploadedKey: string | null = null;

    if (reviewDto.approved) {
      const pdfDefinition = await this.buildPdfDefinition(form);
      const pdfBuffer =
        await this.printerService.createPdfBuffer(pdfDefinition);
      const pdfKey = `documents/${form.type}/${form.createdBy.documentNumber}-${form.id}-${Date.now()}.pdf`;
      uploadedKey = await this.storageService.uploadBuffer(pdfKey, pdfBuffer);
    }

    try {
      await this.formRepository.manager.transaction(async (manager) => {
        const transactionalFormRepository = manager.getRepository(FormEntity);
        const transactionalDocumentRepository = manager.getRepository(Document);

        const transactionalForm = await transactionalFormRepository.findOne({
          where: { id: formId },
          relations: ["createdBy", "approvedBy"],
        });

        if (!transactionalForm) {
          throw new NotFoundException("Formulario no encontrado");
        }

        let document = await transactionalDocumentRepository.findOne({
          where: { form: { id: transactionalForm.id } },
          relations: ["form", "createdBy", "approvedBy"],
        });

        if (!document) {
          document = transactionalDocumentRepository.create({
            form: transactionalForm,
            createdBy: transactionalForm.createdBy,
            approved: false,
            fileUrl: null,
            rejectionReason: null,
          });
        }

        document.approvedBy = reviewerRef;

        if (!reviewDto.approved) {
          document.approved = false;
          document.fileUrl = null;
          document.rejectionReason =
            reviewDto.rejectionReason || reviewDto.notes || null;
          transactionalForm.approvedBy = null;
          await transactionalFormRepository.save(transactionalForm);
          await transactionalDocumentRepository.save(document);
          return;
        }

        document.approved = true;
        document.fileUrl = uploadedKey;
        document.rejectionReason = null;
        transactionalForm.approvedBy = reviewerRef;

        await transactionalFormRepository.save(transactionalForm);
        await transactionalDocumentRepository.save(document);
      });
    } catch (error) {
      if (uploadedKey) {
        await this.storageService.deleteObjectByKey(uploadedKey);
      }
      throw error;
    }

    return this.getById(formId);
  }

  private normalizeBaseData(
    baseData: Record<string, any>,
  ): Partial<FormEntity> {
    const incomingBaseData = baseData as Partial<FormEntity> & {
      birthdate?: Date | string;
      birthDate?: Date | string;
      fecha?: Date | string;
    };

    const normalizedBirthDate =
      incomingBaseData.birthDate ?? incomingBaseData.birthdate;
    const normalizedFecha = incomingBaseData.fecha;

    return {
      ...incomingBaseData,
      birthDate: normalizedBirthDate
        ? new Date(normalizedBirthDate)
        : undefined,
      fecha: normalizedFecha ? new Date(normalizedFecha) : undefined,
    };
  }

  private normalizeSpecificData(
    type: FORMTYPE,
    specificData: Record<string, any>,
    createdBy: User,
  ): Record<string, any> {
    switch (type) {
      case FORMTYPE.PLAN_TRABAJO:
        return {
          professional: createdBy,
          period: specificData.period,
          fundamentation:
            specificData.fundamentation ?? specificData.foundation ?? null,
          generalObjectives: specificData.generalObjectives,
          specificObjectives: specificData.specificObjectives,
          workModality:
            specificData.workModality ?? specificData.approachMethod ?? null,
        };

      case FORMTYPE.INFORME_SEMESTRAL:
        return {
          professional: createdBy,
          period: specificData.period,
          characterization: specificData.characterization,
          periodEvolution:
            specificData.periodEvolution ?? specificData.evolution ?? null,
          suggestions: specificData.suggestions,
        };

      case FORMTYPE.INFORME_ADMISION:
        return {
          introduction: specificData.introduction,
          characterization: specificData.characterization,
        };

      case FORMTYPE.ACTAS:
        return {
          modality: specificData.modality,
          subject: specificData.subject,
        };

      default:
        return specificData;
    }
  }

  private async saveSpecificForm(type: FORMTYPE, child: any) {
    switch (type) {
      case FORMTYPE.INFORME_ADMISION:
        return this.admissionRepository.save(child);
      case FORMTYPE.PLAN_TRABAJO:
        return this.planRepository.save(child);
      case FORMTYPE.INFORME_SEMESTRAL:
        return this.semestralRepository.save(child);
      case FORMTYPE.ACTAS:
        return this.actaRepository.save(child);
      default:
        throw new Error(`Unsupported form type: ${type}`);
    }
  }

  private async getFormEntityById(id: number): Promise<FormEntity> {
    const form = await this.formRepository.findOne({
      where: { id },
      relations: ["createdBy", "approvedBy"],
    });

    if (!form) {
      throw new NotFoundException("Formulario no encontrado");
    }

    return form;
  }

  private async findDocumentsByFormIds(
    formIds: number[],
  ): Promise<Map<number, Document>> {
    if (!formIds.length) {
      return new Map();
    }

    const documents = await this.documentRepository.find({
      where: { form: { id: In(formIds) } },
      relations: ["form"],
      order: { updatedAt: "DESC" },
    });

    const documentsMap = new Map<number, Document>();

    for (const document of documents) {
      const currentFormId = document.form?.id;
      if (!currentFormId || documentsMap.has(currentFormId)) {
        continue;
      }

      documentsMap.set(currentFormId, document);
    }

    return documentsMap;
  }

  private async buildFormResponse(
    form: FormEntity,
    document: Document | null,
  ): Promise<FormResponseDto> {
    const specificData = await this.getSpecificData(form);

    return {
      id: form.id,
      type: form.type,
      baseData: {
        patient: form.patient || null,
        documentNumber: form.documentNumber,
        age: form.age ?? null,
        birthDate: form.birthDate ?? null,
        diagnosis: form.diagnosis || null,
        fecha: form.fecha,
      },
      specificData,
      createdBy: this.mapUserSnapshot(form.createdBy),
      approvedBy: form.approvedBy
        ? this.mapUserSnapshot(form.approvedBy)
        : null,
      review: this.buildReviewStatus(document),
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    };
  }

  private mapUserSnapshot(user: User): FormUserSnapshotDto {
    return {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
    };
  }

  private buildReviewStatus(document: Document | null) {
    if (!document) {
      return {
        status: FormReviewStatus.PENDING,
        approved: null,
        rejectionReason: null,
        fileUrl: null,
        reviewedAt: null,
      };
    }

    if (document.approved) {
      return {
        status: FormReviewStatus.APPROVED,
        approved: true,
        rejectionReason: null,
        fileUrl: document.fileUrl,
        reviewedAt: document.updatedAt,
      };
    }

    if (document.rejectionReason) {
      return {
        status: FormReviewStatus.REJECTED,
        approved: false,
        rejectionReason: document.rejectionReason,
        fileUrl: null,
        reviewedAt: document.updatedAt,
      };
    }

    return {
      status: FormReviewStatus.PENDING,
      approved: false,
      rejectionReason: null,
      fileUrl: null,
      reviewedAt: document.updatedAt,
    };
  }

  private async getSpecificData(
    form: FormEntity,
  ): Promise<Record<string, any> | null> {
    switch (form.type) {
      case FORMTYPE.INFORME_ADMISION: {
        const admission = await this.admissionRepository.findOne({
          where: { form: { id: form.id } },
        });

        if (!admission) {
          return null;
        }

        return {
          introduction: admission.introduction,
          characterization: admission.characterization,
        };
      }

      case FORMTYPE.PLAN_TRABAJO: {
        const plan = await this.planRepository.findOne({
          where: { form: { id: form.id } },
          relations: ["professional"],
        });

        if (!plan) {
          return null;
        }

        return {
          professional: plan.professional
            ? this.mapUserSnapshot(plan.professional)
            : null,
          period: plan.period,
          fundamentation: plan.fundamentation,
          generalObjectives: plan.generalObjectives,
          specificObjectives: plan.specificObjectives,
          workModality: plan.workModality,
        };
      }

      case FORMTYPE.INFORME_SEMESTRAL: {
        const semestral = await this.semestralRepository.findOne({
          where: { form: { id: form.id } },
          relations: ["professional"],
        });

        if (!semestral) {
          return null;
        }

        return {
          professional: semestral.professional
            ? this.mapUserSnapshot(semestral.professional)
            : null,
          period: semestral.period,
          characterization: semestral.characterization,
          periodEvolution: semestral.periodEvolution,
          suggestions: semestral.suggestions,
        };
      }

      case FORMTYPE.ACTAS: {
        const acta = await this.actaRepository.findOne({
          where: { form: { id: form.id } },
        });

        if (!acta) {
          return null;
        }

        return {
          modality: acta.modality,
          subject: acta.subject,
        };
      }

      default:
        return null;
    }
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
