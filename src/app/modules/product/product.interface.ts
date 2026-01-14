import { Document, Types } from "mongoose";

// ======================
// Product Interface
// ======================
export interface IProduct extends Document {
  sku?: string;

  name: string;
  // slug: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];

  price: number;
  offerPrice?: number;
  stock: number;
  weight: number | null;

  category: Types.ObjectId;
  subcategory?: string;

  images: {
    url: string;
    altText?: string;
  }[];

  isActive: boolean;

  averageRating?: number; // calculated from Review
  ratingCount?: number; // total reviews/rating count

  availableSizes: string[];

  keyFeatures: string[];
  specification: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;

  calculateOfferPrice(): Promise<number | null>;
}
