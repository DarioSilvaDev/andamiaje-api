import { Controller, Get, Post, Put, Delete, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { AuthRolesGuard } from "@/modules/auth/guards/auth-roles.guard";
import { OwnerGuard } from "@/modules/auth/guards/owner.guard";
import { Roles } from "@/modules/auth/decorators/roles.decorator";
import { OwnerCheck } from "@/modules/auth/decorators/owner-check.decorator";
import { UserRole } from "../constants/roles.constants";

@ApiTags("Ejemplo de Autorización")
@Controller("example")
@UseGuards(JwtAuthGuard, AuthRolesGuard)
@ApiBearerAuth()
export class AuthorizationExampleController {
  // Solo usuarios con rol DIRECTOR pueden acceder
  @Get("admin-only")
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: "Solo para directores" })
  adminOnlyEndpoint() {
    return { message: "Solo directores pueden ver esto" };
  }

  // Usuarios con rol DIRECTOR o COORDINADOR pueden acceder
  @Get("management")
  @Roles(
    UserRole.DIRECTOR,
    UserRole.COORDINADOR_ALUMNO,
    UserRole.COORDINADOR_FAMILIA
  )
  @ApiOperation({ summary: "Para directores y coordinadores" })
  managementEndpoint() {
    return { message: "Directores y coordinadores pueden ver esto" };
  }

  // Cualquier usuario autenticado puede acceder
  @Get("authenticated")
  @ApiOperation({ summary: "Para cualquier usuario autenticado" })
  authenticatedEndpoint() {
    return { message: "Cualquier usuario autenticado puede ver esto" };
  }

  // Solo el propietario del documento puede acceder
  @Put("document/:id")
  @Roles(
    UserRole.TERAPEUTA,
    UserRole.ACOMPANIANTE_EXTERNO,
    UserRole.COORDINADOR_ALUMNO,
    UserRole.COORDINADOR_FAMILIA
  )
  @UseGuards(OwnerGuard)
  @OwnerCheck({
    entityName: "Document",
    idField: "id",
    ownerField: "createdById",
  })
  @ApiOperation({ summary: "Actualizar documento propio" })
  updateOwnDocument() {
    return { message: "Documento actualizado" };
  }

  // Solo directores pueden aprobar documentos
  @Post("document/:id/approve")
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: "Aprobar documento (solo directores)" })
  approveDocument() {
    return { message: "Documento aprobado" };
  }

  // Solo directores pueden rechazar documentos
  @Post("document/:id/reject")
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: "Rechazar documento (solo directores)" })
  rejectDocument() {
    return { message: "Documento rechazado" };
  }

  // Gestión de usuarios (solo directores)
  @Get("users")
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: "Listar usuarios (solo directores)" })
  listUsers() {
    return { message: "Lista de usuarios" };
  }

  @Post("users")
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: "Crear usuario (solo directores)" })
  createUser() {
    return { message: "Usuario creado" };
  }

  @Delete("users/:id")
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: "Eliminar usuario (solo directores)" })
  deleteUser() {
    return { message: "Usuario eliminado" };
  }
}
