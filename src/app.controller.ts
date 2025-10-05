import { Controller, Get } from "@nestjs/common";
@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      status: "ONLINE",
      version: process.env.NPM_PACKAGE_VERSION,
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }
}
