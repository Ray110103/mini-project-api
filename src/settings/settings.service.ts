import { CloudinaryService } from "../modules/cloudinary/cloudinary.service";
import { PasswordService } from "../modules/password/password.service";
import { PrismaService } from "../modules/prisma/prisma.service";
import { ApiError } from "../utils/api-error";
import { ChangeDashboardPasswordDTO } from "./dto/change-password-dashboard.dto";
import { UpdateDashboardProfileDTO } from "./dto/update-profile-dashboard.dto";


export class SettingsService {
  private prisma: PrismaService;
  private passwordService: PasswordService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.passwordService = new PasswordService();
    this.cloudinaryService = new CloudinaryService();
  }

  getProfile = async (id: number) => {
    const user = this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return user;
  };

  updateProfile = async (
    id: number,
    body: UpdateDashboardProfileDTO,
    pictureProfile?: Express.Multer.File
  ) => {
    const user = await this.prisma.user.findFirst({
      where: { id },
    });

    let updatedPicture = user?.pictureProfile;

    if (pictureProfile) {
      if (user?.pictureProfile)
        await this.cloudinaryService.remove(user.pictureProfile);

      const { secure_url } = await this.cloudinaryService.upload(
        pictureProfile
      );
      updatedPicture = secure_url;
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        ...body,
        pictureProfile: updatedPicture,
      },
    });

    return { message: "Profile Updated" };
  };

  changePassword = async (body: ChangeDashboardPasswordDTO, id: number) => {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new ApiError("User not found", 404);

    const isValid = await this.passwordService.comparePassword(
      body.oldPassword,
      user.password
    );
    if (!isValid) throw new ApiError("Incorrect current password", 400);

    const newHashed = await this.passwordService.hashPassword(body.newPassword);
    await this.prisma.user.update({
      where: { id },
      data: { password: newHashed },
    });

    return { message: "password successfully changed" };
  };
}