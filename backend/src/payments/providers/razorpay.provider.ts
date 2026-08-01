import crypto from "crypto";
import { razorpay } from "../../config/razorpay";
import { env } from "../../config/env";
import {
  IPaymentProvider,
  CreateOrderParams,
  CreateOrderResult,
  VerifyPaymentParams,
} from "../interfaces/paymentProvider.interface";

/**
 * Concrete Strategy implementing Razorpay Payment Gateway integration.
 * Adheres to Single Responsibility (SRP), Open/Closed (OCP), and Liskov Substitution (LSP).
 */
export class RazorpayPaymentProvider implements IPaymentProvider {
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor() {
    this.keyId = env.RAZORPAY_KEY_ID;
    this.keySecret = env.RAZORPAY_KEY_SECRET;
  }

  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    const amountInPaise = Math.round(params.amount * 100);
    const currency = params.currency || "INR";

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: params.bookingId,
    });

    return {
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency,
      keyId: this.keyId,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<boolean> {
    if (typeof params.signature !== "string" || !params.signature) {
      return false;
    }

    const generatedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(`${params.orderId}|${params.paymentId}`)
      .digest("hex");

    const genBuf = Buffer.from(generatedSignature, "utf8");
    const paramBuf = Buffer.from(params.signature, "utf8");

    if (genBuf.length !== paramBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(genBuf, paramBuf);
  }
}
