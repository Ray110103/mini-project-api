import { Request, Response } from "express";
import { TransactionService } from "./transaction.service";
import { ApiError } from "../../utils/api-error";

export class TransactionController {
  private transactionService = new TransactionService();

  createTransaction = async (req: Request, res: Response) => {
    try {
      const authUserId = res.locals.user.id;
      const result = await this.transactionService.createTransaction(
        req.body,
        authUserId
      );
      return res.status(201).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  uploadPaymentProof = async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const paymentProof = files?.paymentProof?.[0];
      if (!paymentProof) throw new ApiError("paymentProof is required", 400);

      const authUserId = res.locals.user.id;

      const result = await this.transactionService.uploadPaymentProof(
        req.params.uuid,
        paymentProof,
        authUserId
      );
      return res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updateTransaction = async (req: Request, res: Response) => {
    try {
      const result = await this.transactionService.updateTransaction(req.body);
      return res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getTransactions = async (req: Request, res: Response) => {
    try {
      const authUserId = res.locals.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const take = parseInt(req.query.take as string) || 5;
      const search = (req.query.search as string) || "";

      const result = await this.transactionService.getUserTransactions({
        userId: authUserId,
        page,
        take,
        search,
      });

      return res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getTransaction = async (req: Request, res: Response) => {
    try {
      const authUserId = res.locals.user.id;
      const { uuid } = req.params;

      if (!uuid) throw new ApiError("UUID is required", 400);

      const result = await this.transactionService.getTransaction(
        uuid,
        authUserId
      );
      return res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  applyVoucher = async (req: Request, res: Response) => {
    try {
      const authUserId = res.locals.user.id;
      const { uuid, code } = req.body;

      if (!uuid || !code) {
        throw new ApiError("UUID and voucher code are required", 400);
      }

      const result = await this.transactionService.applyVoucher(
        uuid,
        code,
        authUserId
      );
      return res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: any) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error("[TransactionController Error]:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
