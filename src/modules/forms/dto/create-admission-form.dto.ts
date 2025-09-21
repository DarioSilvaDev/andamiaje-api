import { IsNotEmpty, IsString } from "class-validator";

export class AdmissionFormDto {
  @IsNotEmpty({ message: "El campo 'introduction' es obligatorio" })
  @IsString({ message: "El campo 'introduction' debe ser texto" })
  introduction: string;

  @IsNotEmpty({ message: "El campo 'characterization' es obligatorio" })
  @IsString({ message: "El campo 'characterization' debe ser texto" })
  characterization: string;
}
