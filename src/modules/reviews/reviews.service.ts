// services/review.service.ts
import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error"; // Assuming ApiError is a custom class
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewDTO } from "./dto/get-review.dto";

export class ReviewService {
  private prisma = new PrismaService();

  // Create a new review for an event
  createReview = async (userId: number, eventId: number, body: CreateReviewDto): Promise<ReviewDTO> => {
    // Check if the event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new ApiError("Event not found", 404); // Throw error if the event does not exist
    }

    // Create a review for the event
    const review = await this.prisma.review.create({
      data: {
        rating: body.rating,
        comment: body.comment,
        eventId,
        userId,
      },
    });

    return {
      id: review.id,
      eventId: review.eventId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment || '',
      createdAt: review.createdAt.toISOString(),
    };
  };

  // Get reviews for a specific event
  getReviewsByEvent = async (eventId: number): Promise<ReviewDTO[]> => {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new ApiError("Event not found", 404); // If the event doesn't exist, throw an error
    }

    // Fetch all reviews for the event
    const reviews = await this.prisma.review.findMany({
      where: { eventId },
      include: {
        user: true, // Include user details (name, etc.)
      },
    });

    return reviews.map((review) => ({
      id: review.id,
      eventId: review.eventId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment || '',
      createdAt: review.createdAt.toISOString(),
    }));
  };
}
