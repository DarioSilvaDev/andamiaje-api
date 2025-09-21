import { Controller, Post, Body, Get, Query } from "@nestjs/common";
import { FormsService } from "./forms.service";
import { CurrentUser } from "../auth";
import { CreateFormDto } from "./dto/create-form.dto";
import { User } from "@/entities";

@Controller("forms")
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  async create(@Body() body: CreateFormDto, @CurrentUser() user: User) {
    return this.formsService.create(
      body.type,
      { ...body.baseData, createdBy: user },
      body.specificData
    );
  }

  @Get()
  async getPendingForms() {
    return this.formsService.getPendings();
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
