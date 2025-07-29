import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { BlogService } from "./blog.service";
import { GetBlogsDTO } from "./dto/get-blog.dto";
import { ApiError } from "../../utils/api-error";

export class BlogController {
  private blogService: BlogService;

  constructor() {
    this.blogService = new BlogService();
  }

  getBlogs = async (req: Request, res: Response) => {
    const query = plainToInstance(GetBlogsDTO, req.query);
    const result = await this.blogService.getBlogs(query);
    res.status(200).send(result);
  };

  createBlog = async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnail = files.thumbnail?.[0];
    if (!thumbnail) throw new ApiError("Thumbnail Is Required", 400);

    const result = await this.blogService.createBlog(
      req.body, // req body -> title, description, category, content
      thumbnail, //file dengan key thumbnail
      res.locals.user.id // user id dalam token 
    );
    res.status(200).send(result);
  };
}
