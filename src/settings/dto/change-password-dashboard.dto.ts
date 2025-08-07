import { IsNotEmpty, IsString } from "class-validator";

export class ChangeDashboardPasswordDTO {
  @IsNotEmpty()
  @IsString()
  oldPassword!: string;

  @IsNotEmpty()
  @IsString()
  newPassword!: string;  
}
