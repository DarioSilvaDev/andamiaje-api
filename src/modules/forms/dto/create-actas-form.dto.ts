import { IsDateString, IsNotEmpty, IsString } from "class-validator";

export class ActaFormDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  modality: string; // presencial o virtual

  @IsNotEmpty()
  @IsString()
  subject: string;
}
