import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FORMTYPE, DocumentStatus } from "@/commons/enums";
import { BaseForm, User } from "@/entities";
import { FormFactoryV2 } from "@/factory/form-factory-v2";

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(BaseForm)
    private readonly formRepository: Repository<BaseForm>,
    private readonly formFactory: FormFactoryV2
  ) {}

  /**
   * Crea un nuevo formulario
   */
  async create(
    type: FORMTYPE,
    baseData: Partial<BaseForm>,
    specificData: any,
    user: User
  ): Promise<BaseForm> {
    // Crear instancia del formulario específico
    const form = this.formFactory.createForm(type, baseData, specificData, user);

    // Validar antes de guardar (opcional en creación)
    try {
      await form.validate();
    } catch (error) {
      // En creación, permitir guardar aunque no pase validaciones completas
      // Solo se validará al enviar para revisión
    }

    // Guardar formulario
    const savedForm = await this.formRepository.save(form);

    return savedForm;
  }

  /**
   * Obtiene formularios pendientes de revisión
   */
  async getPendings(): Promise<BaseForm[]> {
    return this.formRepository.find({
      where: { status: DocumentStatus.PENDING_REVIEW },
      relations: ["createdBy"],
      order: { submittedAt: "ASC" },
    });
  }

  /**
   * Obtiene un formulario por ID
   */
  async findOne(id: string): Promise<BaseForm> {
    const form = await this.formRepository.findOne({
      where: { id },
      relations: ["createdBy", "approvedBy", "rejectedBy", "lastEditedBy"],
    });

    if (!form) {
      throw new BadRequestException("Formulario no encontrado");
    }

    return form;
  }

  /**
   * Obtiene formularios por usuario
   */
  async findByUser(userId: number, status?: DocumentStatus): Promise<BaseForm[]> {
    const where: any = { createdBy: { id: userId } };
    if (status) {
      where.status = status;
    }

    return this.formRepository.find({
      where,
      relations: ["approvedBy", "rejectedBy", "lastEditedBy"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Obtiene formularios por tipo
   */
  async findByType(type: FORMTYPE): Promise<BaseForm[]> {
    return this.formRepository.find({
      where: { type },
      relations: ["createdBy", "approvedBy", "rejectedBy"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Obtiene todos los formularios (solo para director)
   */
  async findAll(): Promise<BaseForm[]> {
    return this.formRepository.find({
      relations: ["createdBy", "approvedBy", "rejectedBy"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Actualiza un formulario
   */
  async update(
    id: string,
    updateData: Partial<BaseForm>,
    user: User
  ): Promise<BaseForm> {
    const form = await this.findOne(id);

    // Verificar permisos
    if (!form.canBeEditedBy(user)) {
      throw new BadRequestException(
        "No tienes permisos para editar este formulario"
      );
    }

    // Aplicar cambios
    Object.assign(form, updateData);
    form.markAsEdited(user);

    return this.formRepository.save(form);
  }

  /**
   * Elimina un formulario (solo borradores)
   */
  async remove(id: string, user: User): Promise<void> {
    const form = await this.findOne(id);

    // Solo se pueden eliminar borradores propios
    if (form.status !== DocumentStatus.DRAFT) {
      throw new BadRequestException(
        "Solo se pueden eliminar formularios en estado borrador"
      );
    }

    if (form.createdBy.id !== user.id) {
      throw new BadRequestException(
        "Solo puedes eliminar tus propios formularios"
      );
    }

    await this.formRepository.remove(form);
  }

  /**
   * Obtiene estadísticas de formularios
   */
  async getStats(userId?: number): Promise<any> {
    const queryBuilder = this.formRepository.createQueryBuilder("form");

    if (userId) {
      queryBuilder.where("form.createdById = :userId", { userId });
    }

    const total = await queryBuilder.getCount();

    const byStatus = await this.formRepository
      .createQueryBuilder("form")
      .select("form.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("form.status")
      .getRawMany();

    const byType = await this.formRepository
      .createQueryBuilder("form")
      .select("form.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("form.type")
      .getRawMany();

    return {
      total,
      byStatus,
      byType,
    };
  }
}

