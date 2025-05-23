import { IUser } from './auth.state.model';
import { IProduct } from './product.model';

// 1. Order Model
export interface IOrder {
  id: number;
  user_id: string;
  seller_id: number;
  product_id: number;
  quantity: number;
  total_cost: number;
  remaining_amount: number;
  installment_amount: number;
  installment_count: number;
  remaining_installments: number;
  payment_frequency: string;
  payment_duration_in_days: number;
  reminder_type: string;
  penalty_percentage: number;
  is_completed: boolean;
  order_payments: IOrderPayment[];
  product: IProduct;
  is_confirmed: number;
  fees: number;
  user: IUser;
  created_at: string;
  updated_at: string;
}

// 2. Order Payment Model
export interface IOrderPayment {
  id: number;
  order_id: number;
  amount_paid: number;
  payment_date: string | null;
  status: string;
  is_late: boolean;
  penalty_fees: number;
  installment_number: number;
  momo_transaction_id: string | null;
  due_date: string;
}

// 3. MoMo Transaction Model
export interface IMomoTransaction {
  id: number;
  user_id: string;
  transaction_id: string;
  provider_transaction_id?: string;
  phone_number: string;
  amount: number;
  fees?: number;
  provider_type: string;
  status: string;
  user: IUser;
  created_at: string;
  updated_at: string;
}

// 4. Momo Payment
export interface IMomoPayment {
  order_id: number;
  phone_number: string;
}

export interface IPawaPayWebhook {
  transaction_id: string;
  transaction_type: string;
  timestamp: string;
  phone_number: string;
  amount: number;
  currency: string;
  country: string;
  correspondent: string;
  status: string;
  description: string;
  customer_timestamp: string;
  created_timestamp: string;
  received_timestamp: string;
  failure_reason: string;
  metadata: any;
  suspicious_activity_report: any;
}
