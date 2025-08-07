import { IsNotEmpty, IsString, IsInt, Min, Max } from "class-validator";

export class CreateReviewDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1) // Minimum rating value of 1
  @Max(5) // Maximum rating value of 5
  rating!: number;

  @IsNotEmpty()
  @IsString()
  comment!: string;

  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  eventId!: string;
}
