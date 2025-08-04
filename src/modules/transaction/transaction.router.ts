import { Router } from "express";
import { JwtMiddleware } from "../../middlewares/jwt.middleware";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";
import { TransactionController } from "./transaction.controller";
import { UploadPaymentProofDTO } from "./dto/upload-payment-proof.dto";
import { UploaderMiddleware } from "../../middlewares/uploader.middleware";
import { UpdateTransactionDTO } from "./dto/update-transaction.dto";
import { validateBody } from "../../middlewares/validate.middleware";

export class TransactionRouter {
  private router: Router;
  private transactionController: TransactionController;
  private jwtMiddleware: JwtMiddleware;
  private uploaderMiddleware: UploaderMiddleware

  constructor() {
    this.router = Router();
    this.transactionController = new TransactionController();
    this.jwtMiddleware = new JwtMiddleware();
    this.uploaderMiddleware = new UploaderMiddleware
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    this.router.post(
      "/",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.jwtMiddleware.verifyRole(["USER"]),
      validateBody(CreateTransactionDTO),
      this.transactionController.createTransaction
    );
    this.router.patch(
      "/payment-proof",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.jwtMiddleware.verifyRole(["USER"]),
      this.uploaderMiddleware.upload().fields([{name: "paymentProof", maxCount: 1}]),
      this.uploaderMiddleware.fileFilter(['image/jpeg', 'image/png', 'image/heic', 'image/avif']),
      validateBody(UploadPaymentProofDTO),
      this.transactionController.uploadPaymentProof
    );
    this.router.patch(
      "/",
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET!),
      this.jwtMiddleware.verifyRole(["ADMIN"]),
      validateBody(UpdateTransactionDTO),
      this.transactionController.updateTransaction
    );
  };

  getRouter = () => {
    return this.router;
  };
}
