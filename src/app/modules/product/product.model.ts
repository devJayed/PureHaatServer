import { Schema, model } from "mongoose";
import { FlashSale } from "../flashSell/flashSale.model";
import { IProduct } from "./product.interface";

// ======================
// Product Schema
// ======================
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
      trim: true,
    },
    // slug: {
    //   type: String,
    //   required: [true, "Product slug is required"],
    //   unique: true,
    //   trim: true,
    // },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    seoKeywords: { type: [String], default: [] },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    offerPrice: { type: Number, default: null },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
      default: null,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    subcategory: {
      type: String,
    },
    images: [
      {
        url: { type: String, required: true },
        altText: { type: String },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableSizes: { type: [String], default: [] },
    keyFeatures: {
      type: [String],
      default: [],
    },
    specification: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to auto-generate the slug before saving
// productSchema.pre<IProduct>("validate", function (next) {
//   if (this.isModified("name") && !this.slug) {
//     this.slug = this.name
//       .toLowerCase()
//       .replace(/ /g, "-")
//       .replace(/[^\w-]+/g, "");
//   }
//   next();
// });

// Middleware to auto-calculate the OfferPrice in case of flashSale
productSchema.methods.calculateOfferPrice = async function () {
  const flashSale = await FlashSale.findOne({ product: this._id });

  if (flashSale) {
    const discount = (flashSale.discountPercentage / 100) * this.price;
    return this.price - discount;
  }

  return null; // or you can return 0 or another default value
};

export const Product = model<IProduct>("Product", productSchema);
