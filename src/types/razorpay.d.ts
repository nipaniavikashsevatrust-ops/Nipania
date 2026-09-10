// Type declarations for Razorpay
declare module 'razorpay' {
  interface RazorpayConfig {
    key_id: string;
    key_secret: string;
  }

  interface OrderOptions {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, any>;
  }

  interface Order {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, any>;
    created_at: number;
  }

  interface Payment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    method: string;
    captured: boolean;
    email: string;
    contact: string;
    created_at: number;
  }

  interface RefundOptions {
    amount?: number;
    speed?: 'normal' | 'optimum';
  }

  interface Refund {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    payment_id: string;
    created_at: number;
    status: string;
  }

  class Razorpay {
    constructor(config: RazorpayConfig);
    orders: {
      create(options: OrderOptions): Promise<Order>;
      fetch(orderId: string): Promise<Order>;
    };
    payments: {
      fetch(paymentId: string): Promise<Payment>;
      refund(paymentId: string, options?: RefundOptions): Promise<Refund>;
    };
  }

  export = Razorpay;
}
