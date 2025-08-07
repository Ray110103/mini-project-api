import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsPositive,
  ValidateNested
} from "class-validator";

class PayloadItem {
  @IsInt()
  @IsPositive()
  ticketId!: number;

  @IsInt()
  @IsPositive()
  qty!: number;
}

export class CreateTransactionDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayloadItem)
  payload!: PayloadItem[];
}
