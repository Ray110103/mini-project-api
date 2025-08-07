import { IsOptional, IsString } from "class-validator";

export class UpdateDashboardProfileDTO {
  @IsOptional()
  @IsString()
  name!: string;
}
