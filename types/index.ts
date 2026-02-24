export type OrderType = 'dinein' | 'takeaway';
export type PaymentType = 'upi' | 'counter';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: string;
  type: OrderType;
  tableNumber?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: any; // Firestore Timestamp
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}
