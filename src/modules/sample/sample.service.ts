import { log } from "console";
import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

export class SampleService {
  private prisma: PrismaService;
  private redisService: RedisService;

  constructor() {
    this.prisma = new PrismaService();
    this.redisService = new RedisService();
  }

  getSamples = async () => {
    const cachedSamples = await this.redisService.getValue("samples");

    if (cachedSamples) {
      console.log("INI DATA DARI REDIS ");
      return JSON.parse(cachedSamples);
    }

    const samples = await this.prisma.sample.findMany();

    console.log("INI DATA DARI DATABASE");
    await this.redisService.setValue("samples", JSON.stringify(samples), 20);

    return samples;
  };

  getSample = async (id: number) => {
    const sample = await this.prisma.sample.findFirst({
      where: { id },
    });

    if (!sample) throw new ApiError("Sample Not Found", 404);

    return sample;
  };
}

// PascalCase -> interface, type, dan class
// camelCase -> function & variable
// snake_case -> biasa digunakan dalam penamaan table dan juga kolom
