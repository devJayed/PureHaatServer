import { Schema, model } from "mongoose";
import { Product } from "../product/product.model";
import { ICounter, IOrder } from "./order.interface";

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    // shop: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Shop",
    //   required: true,
    // },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
      },
    ],
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Received", "In-Processing", "Completed", "Cancelled"],
      default: "Received",
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Card", "Online"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "On-the-Way", "Paid", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const counterSchema = new Schema<ICounter>({
  id: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

// Pre-save hook to calculate total, discount, delivery charge, and final price
orderSchema.pre("validate", async function (next) {
  const order = this;

  // Step 1: Initialize total amount
  let totalAmount = 0;
  let finalDiscount = 0;
  // let shopId: Schema.Types.ObjectId | null = null;

  // Step 2: Calculate total amount for products
  for (let item of order.products) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new Error(`Product not found!.`));
    }
    // if (shopId && String(shopId) !== String(product.shop._id)) {
    //   return next(new Error("Products must be from the same shop."));
    // }

    // //@ts-ignore
    // shopId = product.shop._id;

    const offerPrice = (await product?.calculateOfferPrice()) || 0;

    let productPrice = product.price;
    if (offerPrice) productPrice = Number(offerPrice);

    item.unitPrice = productPrice;
    const price = productPrice * item.quantity;
    // console.log(price);
    totalAmount += price;
  }

  // if (order.coupon) {
  //   const couponDetails = await Coupon.findById(order.coupon);
  //   if (String(shopId) === couponDetails?.shop.toString()) {
  //     throw new AppError(StatusCodes.BAD_REQUEST, "The coupon is not applicable for your selected products")
  //   }
  //   if (couponDetails && couponDetails.isActive) {
  //     if (totalAmount >= couponDetails.minOrderAmount) {
  //       if (couponDetails.discountType === "Percentage") {
  //         finalDiscount = Math.min(
  //           (couponDetails.discountValue / 100) * totalAmount,
  //           couponDetails.maxDiscountAmount
  //             ? couponDetails.maxDiscountAmount
  //             : Infinity
  //         );
  //       } else if (couponDetails.discountType === "Flat") {
  //         finalDiscount = Math.min(couponDetails.discountValue, totalAmount);
  //       }
  //     }
  //   }
  // }

  const isDhaka = order?.shippingAddress?.toLowerCase()?.includes("dhaka");
  const deliveryCharge = isDhaka ? 70 : 130;

  order.totalAmount = totalAmount;
  order.discount = finalDiscount;
  order.deliveryCharge = deliveryCharge;
  order.finalAmount = totalAmount - finalDiscount + deliveryCharge;
  //@ts-ignore
  // order.shop = shopId;

  next();
});

// 🪄 Auto-increment orderId
orderSchema.pre<IOrder>("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { id: "orderId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const nextSeq = counter.seq;
    this.orderId = nextSeq.toString().padStart(6, "0"); // e.g. "000123"
  }
  next();
});

export const Order = model<IOrder>("Order", orderSchema);

export const Counter = model<ICounter>("Counter", counterSchema);
