import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";
import { UpdateTransactionDTO } from "./dto/update-transaction.dto";
import { TransactionQueue } from "./transaction.queue";

export class TransactionService {
  private prisma: PrismaService;
  private transactionQueue: TransactionQueue;
  private mailService: MailService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.transactionQueue = new TransactionQueue();
    this.mailService = new MailService();
    this.cloudinaryService = new CloudinaryService();
  }

  createTransaction = async (
    body: CreateTransactionDTO,
    authUserId: number
  ) => {
    // validate product stock
    // if stock less than quantity throw api error
    // create data on model Transaction and model TransactionDetail

    const payload = body.payload; // [{productid: 1, qty: 1}, {productid: 2, qty: 4}]

    // 1. get all product ID from payload
    const productIds = payload.map((item) => item.productId); // [1,2]

    // 2. fetch all products from DB
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    // 3. validate product availability
    for (const item of payload) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new ApiError(`Product with ID ${item.productId} not found`, 400);
      }

      if (product.stock < item.qty) {
        throw new ApiError(`Insufficent Stock`, 400);
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 4. create data Transaction
      const transaction = await tx.transaction.create({
        data: { userId: authUserId }, // userId from token -> res.locals.user
        include: { user: true },
      });

      // 5. prepare data transactionDetail
      const transactionDetails = payload.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;

        return {
          transactionId: transaction.id,
          productId: product.id,
          qty: item.qty,
          price: product.price,
        };
      });

      // 6. createMany data transactionDetail based on variable transactionDetails
      await tx.transactionDetail.createMany({
        data: transactionDetails,
      });

      // 7/ update stock for each product
      for (const item of payload) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        });
      }

      return transaction;
    });

    // 8. Buat delay job untuk mengecek status transaksi selama 1 menit
    await this.transactionQueue.addNewTransactionQueue(result.uuid);

    // kirim email untuk upload bukti bayar
    await this.mailService.sendMail(
      result.user.email,
      "upload bukti pembayaran",
      "upload-proof",
      {
        name: result.user.name,
        uuid: result.uuid,
        expireAt: new Date(result.createdAt.getTime() + 5 * 60 * 1000),
        year: new Date().getFullYear(),
      }
    );

    return { message: "Create Transaction Success" };
  };

  uploadPaymentProof = async (
    uuid: string,
    paymentProof: Express.Multer.File,
    authUserId: number
  ) => {
    // harus tau terlebih dahulu transaksi nya
    // harus user yang punya transaksi yang bisa upload payment proof

    // Cari trabsaksi berdasarkan uui
    const transaction = await this.prisma.transaction.findFirst({
      where: { uuid },
    });

    // Apabila transaksi tidak ada, thow error
    if (!transaction) {
      throw new ApiError("Transaction Not Found", 400);
    }

    // Apabila userId tidak sesuai di data transaksi dengan userId di dalam token
    // throw error
    if (transaction.userId !== authUserId) {
      throw new ApiError("Unauthorized", 401);
    }

    // upload bukti transfer ke dalam cloudinary
    const { secure_url } = await this.cloudinaryService.upload(paymentProof);

    // Update data di dalam  table transaksi, ubak kolom payment proof dan status
    await this.prisma.transaction.update({
      where: { uuid },
      data: { paymentProof: secure_url, status: "WAITING_FOR_CONFIRMATION" },
    });

    return { message: "Upload Payment Proof Success" };
  };

  updateTransaction = async (body: UpdateTransactionDTO) => {
    const transaction = await this.prisma.transaction.findFirst({
      where: { uuid: body.uuid },
    });

    if (!transaction) {
      throw new ApiError("Transaction not found!", 400);
    }

    if (transaction.status !== "WAITING_FOR_CONFIRMATION") {
      throw new ApiError(
        "Transaction status must be WAITING_FOR_CONFIRMATION",
        400
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { uuid: body.uuid },
        data: { status: body.type === "ACCEPT" ? "PAID" : "REJECT" },
      });

      if (body.type === "REJECT") {
        //ambil semua transaction detail
        const transactionDetails = await tx.transactionDetail.findMany(
          { where: { transactionId: transaction.id },
        });

        //kembalikan stock produk berdasarkan transaction detail
        for (const detail of transactionDetails) {
          await tx.product.update({
            where: { id: detail.productId },
            data: { stock: { increment: detail.qty } },
          });
        }
      }
    });

    return { message: "Update Transaction Success" };
  };
}
