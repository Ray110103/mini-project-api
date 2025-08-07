// dtos/review.dto.ts
import { IsInt, IsString, IsOptional } from "class-validator";

export class ReviewDTO {
  @IsInt()
  id!: number; // Review ID

  @IsInt()
  eventId!: number; // ID of the event the review is related to

  @IsInt()
  userId!: number; // ID of the user who created the review

  @IsInt()
  rating!: number; // Rating (e.g., 1 to 5 stars)

  @IsOptional()
  @IsString()
  comment?: string; // Optional comment from the user

  @IsString()
  createdAt!: string; // Timestamp for when the review was created
}
