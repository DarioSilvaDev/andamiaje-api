import { Module } from "@nestjs/common";
import { PrinterService } from "./printer.service";
import { PrinterController } from "./printer.controller";

@Module({
  controllers: [PrinterController],
  providers: [PrinterService],
  exports: [PrinterService], // Exporting the service to be used in other modules
})
export class PrinterModule {}
