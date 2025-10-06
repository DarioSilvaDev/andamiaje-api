import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "./modules/auth/decorators/public.decorator";

@ApiTags("Health Check")
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({
    summary: "Health Check",
    description: "Verifica el estado de la API",
  })
  @ApiResponse({
    status: 200,
    description: "API funcionando correctamente",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ONLINE" },
        version: { type: "string", example: "1.0.0" },
        env: { type: "string", example: "development" },
        timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
      },
    },
  })
  getRoot() {
    return {
      status: "ONLINE",
      version: process.env.NPM_PACKAGE_VERSION,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }
}
