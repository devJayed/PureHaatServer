import { z } from "zod";

export const orderValidation = {
  create: z.object({
    name: z.string().min(1, "Customer name is required"),
    mobile: z.string().min(1, "Mobile number is required"),
  }),
  update: z.object({
    id: z.string().uuid("Invalid ID format"),
    name: z.string().optional(),
  }),
};

/**
 * Same regex as frontend
 */
const nameRegex = /^[A-Za-z\u0980-\u09FF]+(?:\s+[A-Za-z\u0980-\u09FF]+)*$/;

export const createOrderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে")
    .regex(nameRegex, "শুধু বাংলা ও ইংরেজি অক্ষর ব্যবহার করুন"),

  mobile: z.string().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন"),

  shippingAddress: z.string().trim().min(4, "ঠিকানা কমপক্ষে ৪ অক্ষরের হতে হবে"),

  city: z.string().min(1, "শিপিং মেথড নির্বাচন করুন"),

  products: z
    .array(
      z.object({
        product: z.string().min(1, "Product ID required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        color: z.string().min(1),
      }),
    )
    .min(1, "At least one product is required"),

  coupon: z.string().optional().nullable(),
});
