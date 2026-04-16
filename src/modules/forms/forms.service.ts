import {
  CompanionFollowupForm,
  Document,
  FamilyFollowupForm,
  FormEntity,
  FormReviewAction,
  FormReviewAudit,
  InvoiceForm,
  MonthlyReportForm,
  User,
} from "@/entities";
import { ActaForm } from "@/entities/acta.form.entity";
import { AdmissionForm } from "@/entities/admissions.entity";
import { PlanForm } from "@/entities/planForm.entity";
import { SemestralReportForm } from "@/entities/semestral_reports.entity";
import { FormFactory } from "@/factory/form.factory";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { In, Repository } from "typeorm";
import { FORMTYPE, UserRole } from "../../commons/enums";
import {
  buildAdmissionPdf,
  buildCompanionFollowupPdf,
  buildFamilyFollowupPdf,
  buildInvoicePdf,
  buildMonthlyReportPdf,
  buildPlanPdf,
  buildSemestralPdf,
} from "../pdfReports/form-pdf.builders";
import { buildActa } from "../pdfReports/actas.pdf.builder";
import { PrinterService } from "../printer/printer.service";
import { NotificationsService } from "../notifications/notifications.service";
import { StorageService } from "../storage/storage.service";
import {
  FormResponseDto,
  FormReviewHistoryAction,
  FormReviewHistoryItemDto,
  FormReviewStatus,
  FormUserSnapshotDto,
} from "./dto/form-response.dto";
import { ReviewFormDto } from "./dto/review-form.dto";

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
    @InjectRepository(MonthlyReportForm)
    private readonly monthlyRepository: Repository<MonthlyReportForm>,
    @InjectRepository(CompanionFollowupForm)
    private readonly companionRepository: Repository<CompanionFollowupForm>,
    @InjectRepository(FamilyFollowupForm)
    private readonly familyRepository: Repository<FamilyFollowupForm>,
    @InjectRepository(InvoiceForm)
    private readonly invoiceRepository: Repository<InvoiceForm>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(FormReviewAudit)
    private readonly formReviewAuditRepository: Repository<FormReviewAudit>,
    private readonly printerService: PrinterService,
    private readonly storageService: StorageService,
    private readonly formFactory: FormFactory,
    private readonly notificationsService: NotificationsService,
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

    const formIds = forms.map((form) => form.id);
    const documentsMap = await this.findDocumentsByFormIds(formIds);
    const reviewHistoryMap = await this.findReviewHistoryByFormIds(formIds);

    const pendingForms = forms.filter((form) => {
      const document = documentsMap.get(form.id);
      return !document?.approved;
    });

    return Promise.all(
      pendingForms.map((form) =>
        this.buildFormResponse(
          form,
          documentsMap.get(form.id) || null,
          reviewHistoryMap.get(form.id) || [],
        ),
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

    const formIds = forms.map((form) => form.id);
    const documentsMap = await this.findDocumentsByFormIds(formIds);
    const reviewHistoryMap = await this.findReviewHistoryByFormIds(formIds);

    return Promise.all(
      forms.map((form) =>
        this.buildFormResponse(
          form,
          documentsMap.get(form.id) || null,
          reviewHistoryMap.get(form.id) || [],
        ),
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

    const reviewHistoryMap = await this.findReviewHistoryByFormIds([id]);

    return this.buildFormResponse(
      form,
      document || null,
      reviewHistoryMap.get(id) || [],
    );
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
        const transactionalReviewAuditRepository =
          manager.getRepository(FormReviewAudit);

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
          const savedDocument =
            await transactionalDocumentRepository.save(document);

          await transactionalReviewAuditRepository.save(
            transactionalReviewAuditRepository.create({
              form: transactionalForm,
              document: savedDocument,
              reviewedBy: reviewerRef,
              action: FormReviewAction.REJECTED,
              reason: document.rejectionReason,
              metadata: {
                approved: false,
              },
            }),
          );
          return;
        }

        document.approved = true;
        document.fileUrl = uploadedKey;
        document.rejectionReason = null;
        transactionalForm.approvedBy = reviewerRef;

        await transactionalFormRepository.save(transactionalForm);
        const savedDocument =
          await transactionalDocumentRepository.save(document);

        await transactionalReviewAuditRepository.save(
          transactionalReviewAuditRepository.create({
            form: transactionalForm,
            document: savedDocument,
            reviewedBy: reviewerRef,
            action: FormReviewAction.APPROVED,
            reason: null,
            metadata: {
              approved: true,
              fileUrl: uploadedKey,
            },
          }),
        );
      });
    } catch (error) {
      if (uploadedKey) {
        await this.storageService.deleteObjectByKey(uploadedKey);
      }
      throw error;
    }

    const reviewedForm = await this.getById(formId);

    if (reviewedForm.createdBy?.id && form.createdBy?.email) {
      await this.notificationsService.notifyFormReviewed({
        formId: reviewedForm.id,
        formType: reviewedForm.type,
        approved: reviewedForm.review.status === FormReviewStatus.APPROVED,
        rejectionReason: reviewedForm.review.rejectionReason,
        fileUrl: reviewedForm.review.fileUrl,
        reviewerId: reviewer.id,
        recipientEmail: form.createdBy.email,
      });
    }

    return reviewedForm;
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

      case FORMTYPE.REPORTE_MENSUAL:
        return {
          professional: createdBy,
          period: specificData.period,
          activities: specificData.activities,
          progress: specificData.progress,
          observations: specificData.observations,
        };

      case FORMTYPE.SEGUIMIENTO_ACOMPANANTE:
        return {
          professional: createdBy,
          period: specificData.period,
          accompanimentDetail: specificData.accompanimentDetail,
          studentEvolution: specificData.studentEvolution,
          recommendations: specificData.recommendations,
        };

      case FORMTYPE.SEGUIMIENTO_FAMILIA:
        return {
          professional: createdBy,
          period: specificData.period,
          familyContext: specificData.familyContext,
          interventionSummary: specificData.interventionSummary,
          recommendations: specificData.recommendations,
        };

      case FORMTYPE.FACTURA:
        return {
          issuerName: specificData.issuerName,
          taxId: specificData.taxId,
          billingPeriod: specificData.billingPeriod,
          amount: specificData.amount,
          serviceDescription: specificData.serviceDescription,
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
      case FORMTYPE.REPORTE_MENSUAL:
        return this.monthlyRepository.save(child);
      case FORMTYPE.SEGUIMIENTO_ACOMPANANTE:
        return this.companionRepository.save(child);
      case FORMTYPE.SEGUIMIENTO_FAMILIA:
        return this.familyRepository.save(child);
      case FORMTYPE.FACTURA:
        return this.invoiceRepository.save(child);
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

  private async findReviewHistoryByFormIds(
    formIds: number[],
  ): Promise<Map<number, FormReviewAudit[]>> {
    if (!formIds.length) {
      return new Map();
    }

    const audits = await this.formReviewAuditRepository.find({
      where: { form: { id: In(formIds) } },
      relations: ["form", "reviewedBy"],
      order: { createdAt: "DESC" },
    });

    const historyMap = new Map<number, FormReviewAudit[]>();

    for (const audit of audits) {
      const formId = audit.form?.id;
      if (!formId) {
        continue;
      }

      if (!historyMap.has(formId)) {
        historyMap.set(formId, []);
      }

      historyMap.get(formId).push(audit);
    }

    return historyMap;
  }

  private async buildFormResponse(
    form: FormEntity,
    document: Document | null,
    reviewHistory: FormReviewAudit[],
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
      review: this.buildReviewStatus(document, reviewHistory),
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

  private mapReviewHistory(
    history: FormReviewAudit[],
  ): FormReviewHistoryItemDto[] {
    return history.map((item) => ({
      id: item.id,
      action:
        item.action === FormReviewAction.APPROVED
          ? FormReviewHistoryAction.APPROVED
          : FormReviewHistoryAction.REJECTED,
      reason: item.reason || null,
      reviewedAt: item.createdAt,
      reviewedBy: this.mapUserSnapshot(item.reviewedBy),
      fileUrl:
        item.action === FormReviewAction.APPROVED
          ? item.metadata?.fileUrl || null
          : null,
    }));
  }

  private buildReviewStatus(
    document: Document | null,
    reviewHistory: FormReviewAudit[],
  ) {
    const mappedHistory = this.mapReviewHistory(reviewHistory);
    const lastHistoryItem = mappedHistory[0] || null;

    if (!document) {
      return {
        status: FormReviewStatus.PENDING,
        approved: null,
        rejectionReason: null,
        fileUrl: null,
        reviewedAt: lastHistoryItem?.reviewedAt || null,
        history: mappedHistory,
      };
    }

    if (document.approved) {
      return {
        status: FormReviewStatus.APPROVED,
        approved: true,
        rejectionReason: null,
        fileUrl: document.fileUrl,
        reviewedAt: lastHistoryItem?.reviewedAt || document.updatedAt,
        history: mappedHistory,
      };
    }

    if (document.rejectionReason) {
      return {
        status: FormReviewStatus.REJECTED,
        approved: false,
        rejectionReason: document.rejectionReason,
        fileUrl: null,
        reviewedAt: lastHistoryItem?.reviewedAt || document.updatedAt,
        history: mappedHistory,
      };
    }

    return {
      status: FormReviewStatus.PENDING,
      approved: false,
      rejectionReason: null,
      fileUrl: null,
      reviewedAt: lastHistoryItem?.reviewedAt || document.updatedAt,
      history: mappedHistory,
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

      case FORMTYPE.REPORTE_MENSUAL: {
        const monthly = await this.monthlyRepository.findOne({
          where: { form: { id: form.id } },
          relations: ["professional"],
        });

        if (!monthly) {
          return null;
        }

        return {
          professional: monthly.professional
            ? this.mapUserSnapshot(monthly.professional)
            : null,
          period: monthly.period,
          activities: monthly.activities,
          progress: monthly.progress,
          observations: monthly.observations,
        };
      }

      case FORMTYPE.SEGUIMIENTO_ACOMPANANTE: {
        const companion = await this.companionRepository.findOne({
          where: { form: { id: form.id } },
          relations: ["professional"],
        });

        if (!companion) {
          return null;
        }

        return {
          professional: companion.professional
            ? this.mapUserSnapshot(companion.professional)
            : null,
          period: companion.period,
          accompanimentDetail: companion.accompanimentDetail,
          studentEvolution: companion.studentEvolution,
          recommendations: companion.recommendations,
        };
      }

      case FORMTYPE.SEGUIMIENTO_FAMILIA: {
        const family = await this.familyRepository.findOne({
          where: { form: { id: form.id } },
          relations: ["professional"],
        });

        if (!family) {
          return null;
        }

        return {
          professional: family.professional
            ? this.mapUserSnapshot(family.professional)
            : null,
          period: family.period,
          familyContext: family.familyContext,
          interventionSummary: family.interventionSummary,
          recommendations: family.recommendations,
        };
      }

      case FORMTYPE.FACTURA: {
        const invoice = await this.invoiceRepository.findOne({
          where: { form: { id: form.id } },
        });

        if (!invoice) {
          return null;
        }

        return {
          issuerName: invoice.issuerName,
          taxId: invoice.taxId,
          billingPeriod: invoice.billingPeriod,
          amount: Number(invoice.amount),
          serviceDescription: invoice.serviceDescription,
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

    if (form.type === FORMTYPE.INFORME_ADMISION) {
      const admission = await this.admissionRepository.findOne({
        where: { form: { id: form.id } },
      });

      if (admission) {
        return buildAdmissionPdf({
          patient: form.patient || "Sin dato",
          diagnosis: form.diagnosis || "Sin dato",
          introduction: admission.introduction,
          characterization: admission.characterization,
          professional: form.createdBy.fullName,
          date: form.fecha,
        });
      }
    }

    if (form.type === FORMTYPE.PLAN_TRABAJO) {
      const plan = await this.planRepository.findOne({
        where: { form: { id: form.id } },
      });

      if (plan) {
        return buildPlanPdf({
          patient: form.patient || "Sin dato",
          period: plan.period,
          fundamentation: plan.fundamentation,
          generalObjectives: plan.generalObjectives,
          specificObjectives: plan.specificObjectives,
          workModality: plan.workModality,
          professional: form.createdBy.fullName,
        });
      }
    }

    if (form.type === FORMTYPE.INFORME_SEMESTRAL) {
      const semestral = await this.semestralRepository.findOne({
        where: { form: { id: form.id } },
      });

      if (semestral) {
        return buildSemestralPdf({
          patient: form.patient || "Sin dato",
          period: semestral.period,
          characterization: semestral.characterization,
          periodEvolution: semestral.periodEvolution,
          suggestions: semestral.suggestions,
          professional: form.createdBy.fullName,
        });
      }
    }

    if (form.type === FORMTYPE.REPORTE_MENSUAL) {
      const monthly = await this.monthlyRepository.findOne({
        where: { form: { id: form.id } },
      });

      if (monthly) {
        return buildMonthlyReportPdf({
          patient: form.patient || "Sin dato",
          period: monthly.period,
          activities: monthly.activities,
          progress: monthly.progress,
          observations: monthly.observations,
          professional: form.createdBy.fullName,
        });
      }
    }

    if (form.type === FORMTYPE.SEGUIMIENTO_ACOMPANANTE) {
      const companion = await this.companionRepository.findOne({
        where: { form: { id: form.id } },
      });

      if (companion) {
        return buildCompanionFollowupPdf({
          patient: form.patient || "Sin dato",
          period: companion.period,
          accompanimentDetail: companion.accompanimentDetail,
          studentEvolution: companion.studentEvolution,
          recommendations: companion.recommendations,
          professional: form.createdBy.fullName,
        });
      }
    }

    if (form.type === FORMTYPE.SEGUIMIENTO_FAMILIA) {
      const family = await this.familyRepository.findOne({
        where: { form: { id: form.id } },
      });

      if (family) {
        return buildFamilyFollowupPdf({
          patient: form.patient || "Sin dato",
          period: family.period,
          familyContext: family.familyContext,
          interventionSummary: family.interventionSummary,
          recommendations: family.recommendations,
          professional: form.createdBy.fullName,
        });
      }
    }

    if (form.type === FORMTYPE.FACTURA) {
      const invoice = await this.invoiceRepository.findOne({
        where: { form: { id: form.id } },
      });

      if (invoice) {
        return buildInvoicePdf({
          patient: form.patient || "Sin dato",
          issuerName: invoice.issuerName,
          taxId: invoice.taxId,
          billingPeriod: invoice.billingPeriod,
          amount: Number(invoice.amount),
          serviceDescription: invoice.serviceDescription,
        });
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
