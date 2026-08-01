export interface CreateOrderParams {
  bookingId: string;
  amount: number; // in INR
  currency?: string;
}

export interface CreateOrderResult {
  orderId: string;
  amount: number; // in subunits (paise)
  currency: string;
  keyId: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

/**
 * Strategy interface for external payment providers.
 * Adheres to Interface Segregation (ISP) and Dependency Inversion (DIP).
 */
export interface IPaymentProvider {
  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<boolean>;
}
