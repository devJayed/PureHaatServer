// ======================
// Review Interface
// ======================
import { Schema } from "mongoose";

export interface IReview {
  review: string; // comment
  rating: number; // ⭐ 1–5
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  isFlagged?: boolean;
  flaggedReason?: string;
  isVerifiedPurchase?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
