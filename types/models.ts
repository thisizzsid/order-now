import { OrderType, PaymentType, PaymentStatus, OrderStatus, OrderItem } from "./index";

export interface Customer {
  id?: string;
  name: string;
  mobile: string;
  verified: boolean;
  createdAt: any;
}

export interface Order {
  id?: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  type: OrderType;
  tableNumber?: string;
  items: OrderItem[];
  totalAmount: number;
  taxAmount: number;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: any;
  queuePosition?: number;
  estimatedWaitTime?: number; // in minutes
}
