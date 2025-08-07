// // controllers/review.controller.ts
// import { Request, Response, NextFunction } from "express";
// import { ApiError } from "../../utils/api-error"; // Assuming ApiError is your custom error class
// import { ReviewService } from "./reviews.service";
// import { CreateReviewDto } from "./dto/create-review.dto";

// export class ReviewController {
//   private reviewService: ReviewService;

//   constructor() {
//     this.reviewService = new ReviewService();
//   }

//   // Handle creating a new review for an event
//   public createReview = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // Access the `user` from the request object (added by the JWT middleware)

//       // Get the event ID from the URL params and review data from the body
//       const eventId = parseInt(req.params.eventId); 
//       const reviewData: CreateReviewDto = req.body; 

//       if (!reviewData.rating) {
//         throw new ApiError("Rating is required", 400);  // If no rating is provided
//       }

//       // Call the service to create the review
//       const review = await this.reviewService.createReview( eventId, reviewData);

//       res.status(201).json(review); // Return the created review
//     } catch (error) {
//       next(error);  // Pass any errors to the error middleware
//     }
//   };

//   // Handle fetching reviews for a specific event
//   public getReviewsByEvent = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const eventId = parseInt(req.params.eventId); // Get event ID from the URL params

//       // Call the service to fetch reviews
//       const reviews = await this.reviewService.getReviewsByEvent(eventId);

//       res.status(200).json(reviews); // Return the reviews for the event
//     } catch (error) {
//       next(error);  // Pass the error to the error middleware
//     }
//   };
// }
