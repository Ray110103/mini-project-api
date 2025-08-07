import { Router } from "express";
import { JwtMiddleware } from "../middlewares/jwt.middleware";
import { UploaderMiddleware } from "../middlewares/uploader.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { ChangeDashboardPasswordDTO, } from "./dto/change-password-dashboard.dto";
import { UpdateDashboardProfileDTO } from "./dto/update-profile-dashboard.dto";
import { SettingsController } from "./settings.controller";

export class SettingsRouter {
  private router: Router;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware;
  private settingsController: SettingsController;
  constructor() {
    this.router = Router();
    this.settingsController = new SettingsController();
    this.jwtMiddleware = new JwtMiddleware();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get(
      "/",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.settingsController.getProfile
    );
    this.router.patch(
      "/edit",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: "pictureProfile", maxCount: 1 }]),
      this.uploaderMiddleware.fileFilter([
        "image/jpeg",
        "image/png",
        "image/avif",
        "image/webp",
      ]),
      validateBody(UpdateDashboardProfileDTO),
      this.settingsController.updateProfile
    );

    this.router.patch(
      "/change-password",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      validateBody(ChangeDashboardPasswordDTO),
      this.settingsController.changePassword
    );
  };

  getRouter = () => {
    return this.router;
  };
}
