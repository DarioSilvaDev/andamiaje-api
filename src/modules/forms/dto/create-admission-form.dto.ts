import { IsNotEmpty, IsString } from "class-validator";

export class AdmissionFormDto {
  @IsNotEmpty()
  @IsString()
  introduction: string;

  @IsNotEmpty()
  @IsString()
  characterization: string;
}
