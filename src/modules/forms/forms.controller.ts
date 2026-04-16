import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  ForbiddenException,
  UseGuards,
} from "@nestjs/common";
import { FormsService } from "./forms.service";
import { CurrentUser, OwnerCheck, OwnerGuard } from "../auth";
import { CreateFormDto } from "./dto/create-form.dto";
import { FormEntity, User } from "@/entities";
import { ReviewFormDto } from "./dto/review-form.dto";
import { UserRole } from "@/commons/enums";

@Controller("forms")
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  async create(@Body() body: CreateFormDto, @CurrentUser() user: User) {
    return this.formsService.create(
      body.type,
      { ...body.baseData, createdBy: user },
      body.specificData,
    );
  }

  @Get()
  async getForms(@CurrentUser() user: User) {
    return this.formsService.getFormsByUser(user);
  }

  @Get("pending")
  async getPendingForms(@CurrentUser() user: User) {
    if (user.role !== UserRole.DIRECTOR) {
      throw new ForbiddenException(
        "Solo directores pueden listar formularios pendientes",
      );
    }

    return this.formsService.getPendings();
  }

  @Get(":id")
  @UseGuards(OwnerGuard)
  @OwnerCheck({
    entity: FormEntity,
    idField: "id",
    ownerField: "createdBy.id",
    relations: ["createdBy"],
  })
  async getById(@Param("id", ParseIntPipe) id: number) {
    return this.formsService.getById(id);
  }

  @Patch(":id/review")
  async reviewForm(
    @Param("id", ParseIntPipe) id: number,
    @Body() reviewDto: ReviewFormDto,
    @CurrentUser() reviewer: User,
  ) {
    return this.formsService.reviewForm(id, reviewDto, reviewer);
  }

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
