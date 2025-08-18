import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";

import { CreateDocumentDto } from "./dto/create-document.dto";
// import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from "../auth";
import { DocumentsService } from "./documents.service";

@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateDocumentDto, @Req() req) {
    const user = req.user; // viene del token JWT
    return this.documentsService.create(dto, user);
  }

  // @Get()
  // findAll() {
  //   return this.documentsService.findAll();
  // }

  // @Get(":id")
  // findOne(@Param("id") id: string) {
  //   return this.documentsService.findOne(+id);
  // }

  // @Patch(":id")
  // update(
  //   @Param("id") id: string,
  //   @Body() updateDocumentDto: UpdateDocumentDto
  // ) {
  //   return this.documentsService.update(+id, updateDocumentDto);
  // }

  // @Delete(":id")
  // remove(@Param("id") id: string) {
  //   return this.documentsService.remove(+id);
  // }
}
