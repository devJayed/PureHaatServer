import { Document, Types } from "mongoose";
import { IPayment } from "../payment/payment.interface";

export interface IOrderProduct {
  product: Types.ObjectId;
  quantity: number;
  // unitPrice: number;
  color: string;
}

export interface IOrder extends Document {
  name: string;
  mobile: string;
  email?: string;
  orderId: string;
  // shop: Types.ObjectId;
  products: IOrderProduct[];
  coupon: Types.ObjectId | null;
  totalAmount: number;
  discount: number;
  deliveryCharge: number;
  finalAmount: number;
  status: "Received" | "In-Processing" | "Completed" | "Cancelled";
  city: string;
  shippingAddress: string;
  paymentMethod: "COD" | "Card" | "Online";
  paymentStatus: "Pending" | "On-the-Way" | "Paid" | "Cancelled";
  createdAt?: Date;
  updatedAt?: Date;
  payment?: IPayment | null;
}

export interface ICounter {
  id: string; // name of the counter, e.g., "orderId"
  seq: number;
}
