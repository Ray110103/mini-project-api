import { Router } from "express";
import { BlogController } from "./blog.controller";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware";
import { validateBody } from "../../middlewares/validation.middleware";
import { CreateBlogDTO } from "./dto/create-blog.dto";

export class BlogRouter {
  private router: Router;
  private blogController: BlogController;
  private jwtMiddleware: JwtMiddleware;
  private uploadeerMiddleware: UploaderMiddleware;

  constructor() {
    this.router = Router();
    this.blogController = new BlogController();
    this.jwtMiddleware = new JwtMiddleware();
    this.uploadeerMiddleware = new UploaderMiddleware();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    this.router.get("/", this.blogController.getBlogs);
    this.router.post(
      "/", //1
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!), //2
      this.uploadeerMiddleware .upload() .fields([{ name: "thumbnail", maxCount: 1 }]), //3
      this.uploadeerMiddleware .fileFilter(["image/jpeg", "image/png", "image/avif"]), //4
      validateBody(CreateBlogDTO), // 5
      this.blogController.createBlog // 6
    );
  };

  getRouter = () => {
    return this.router;
  };
}
