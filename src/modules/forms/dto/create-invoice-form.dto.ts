import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class InvoiceFormDto {
  @IsNotEmpty({ message: "El campo 'issuerName' es obligatorio" })
  @IsString({ message: "El campo 'issuerName' debe ser texto" })
  issuerName: string;

  @IsNotEmpty({ message: "El campo 'taxId' es obligatorio" })
  @IsString({ message: "El campo 'taxId' debe ser texto" })
  taxId: string;

  @IsNotEmpty({ message: "El campo 'billingPeriod' es obligatorio" })
  @IsString({ message: "El campo 'billingPeriod' debe ser texto" })
  billingPeriod: string;

  @IsNumber({}, { message: "El campo 'amount' debe ser numerico" })
  @Min(0, { message: "El campo 'amount' debe ser mayor o igual a 0" })
  amount: number;

  @IsNotEmpty({ message: "El campo 'serviceDescription' es obligatorio" })
  @IsString({ message: "El campo 'serviceDescription' debe ser texto" })
  serviceDescription: string;
}
