import { PartialType } from "@nestjs/swagger";
import { BaseFormDto } from "./create-base-form.dto";

export class UpdateFormDto extends PartialType(BaseFormDto) {}
