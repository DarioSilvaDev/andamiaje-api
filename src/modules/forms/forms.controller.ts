import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Param,
  ParseIntPipe,
  ForbiddenException,
} from "@nestjs/common";
import { FormsService } from "./forms.service";
import { CurrentUser } from "../auth";
import { CreateFormDto } from "./dto/create-form.dto";
import { User } from "@/entities";
import { FORMTYPE, UserRole } from "@/commons/enums";

@Controller("forms")
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  async create(@Body() body: CreateFormDto, @CurrentUser() user: User) {
    const rolePermissions: Record<UserRole, FORMTYPE[]> = {
      [UserRole.DIRECTOR]: Object.values(FORMTYPE),
      [UserRole.COORDINADOR_UNO]: [
        FORMTYPE.INFORME_SEMESTRAL,
        FORMTYPE.INFORME_ADMISION,
        FORMTYPE.PLAN_TRABAJO,
        FORMTYPE.SEGUIMIENTO_ACOMPANANTE,
        FORMTYPE.ACTAS,
        FORMTYPE.FACTURA,
        FORMTYPE.REPORTE_MENSUAL,
      ],
      [UserRole.COORDINADOR_DOS]: [
        FORMTYPE.SEGUIMIENTO_FAMILIA,
        FORMTYPE.ACTAS,
        FORMTYPE.FACTURA,
        FORMTYPE.INFORME_SEMESTRAL,
      ],
      [UserRole.TERAPEUTA]: [
        FORMTYPE.PLAN_TRABAJO,
        FORMTYPE.INFORME_SEMESTRAL,
        FORMTYPE.ACTAS,
        FORMTYPE.FACTURA,
        FORMTYPE.INFORME_ADMISION,
      ],
      [UserRole.ACOMPANIANTE_EXTERNO]: [
        FORMTYPE.REPORTE_MENSUAL,
        FORMTYPE.PLAN_TRABAJO,
        FORMTYPE.FACTURA,
      ],
    };

    const userRole = user.role[0]; // si solo tiene uno
    const allowedForms = rolePermissions[userRole] ?? [];

    if (!allowedForms.includes(body.type)) {
      throw new ForbiddenException(
        `Acceso denegado: el rol "${userRole}" no puede crear formularios de tipo "${body.type}"`
      );
    }

    // 3. Ejecutar creación
    return this.formsService.create(
      body.type,
      body.baseData as any,
      body.specificData,
      user
    );
  }

  @Get()
  async getPendingForms() {
    return this.formsService.getPendings();
  }

  // @Patch(":idForm")
  // async approve(
  //   @Param("idForm", ParseIntPipe) idForm: number,
  //   @CurrentUser() user: User
  // ) {
  //   return this.formsService.approve(idForm, user);
  // }

  /*
  GET /forms/:id

  {
  "id": 1,
  "type": "ADMISSION",
  "patient": "Juan Pérez",
  "dni": "12345678",
  "age": 35,
  "birthDate": "1988-05-10",
  "diagnosis": "Trastorno del lenguaje",
  "date": "2025-09-13",
  "specific": {
    "introduction": "El paciente ingresa con antecedentes...",
    "characterization": "Presenta dificultades en la comunicación..."
  },
  "createdBy": {
    "id": 5,
    "fullName": "Ana López",
    "role": "TERAPEUTA"
  }
}

  */

  /*
PATCH /forms/:id/approve
  {
    "approved": true
  }

*/

  /*
1. Marca el formulario como aprobado (approvedBy = director_id en forms).

2. Genera el PDF a partir de la data.

3. Guarda la URL del PDF en la tabla documents. */
}
