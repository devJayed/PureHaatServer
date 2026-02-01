import { StatusCodes } from "http-status-codes";
import mongoose, { Types } from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/appError";
import { IJwtPayload } from "../auth/auth.interface";
import { Coupon } from "../coupon/coupon.model";
import { Payment } from "../payment/payment.model";
import { Product } from "../product/product.model";
import { IOrder } from "./order.interface";
import { Order } from "./order.model";

const createOrder = async (
  orderData: Partial<IOrder>,
  // authUser: IJwtPayload
) => {
  console.log({ orderData });
  // ✅ Transform products safely

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /** ✅ ALWAYS normalize products */
    const products: any = orderData?.products?.map((item: any) => ({
      product: new Types.ObjectId(item.product),
      quantity: item.quantity,
      color: item.color,
    }));

    if (products) {
      /** 🔒 Stock validation */
      for (const productItem of products) {
        const product = await Product.findById(productItem.product).session(
          session,
        );

        if (product) {
          if (product.isActive === false) {
            throw new Error(`Product ${product?.name} is inactive.`);
          }

          if (product.stock < productItem.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name}`);
          }
          // Decrement the product stock
          product.stock -= productItem.quantity;
          await product.save({ session });
        } else {
          throw new Error(`Product not found: ${productItem.product}`);
        }
      }
    }

    // Handle coupon and update orderData
    if (orderData.coupon) {
      const coupon = await Coupon.findOne({ code: orderData.coupon }).session(
        session,
      );
      if (coupon) {
        const currentDate = new Date();

        // Check if the coupon is within the valid date range
        if (currentDate < coupon.startDate) {
          throw new Error(`Coupon ${coupon.code} has not started yet.`);
        }

        if (currentDate > coupon.endDate) {
          throw new Error(`Coupon ${coupon.code} has expired.`);
        }

        orderData.coupon = coupon._id as Types.ObjectId;
      } else {
        throw new Error("Invalid coupon code.");
      }
    }
    /** ✅ SINGLE Order creation*/
    const order = new Order({
      name: orderData.name,
      mobile: orderData.mobile,
      shippingAddress: orderData.shippingAddress,
      city: orderData.city,
      paymentMethod: orderData.paymentMethod,
      coupon: orderData.coupon ?? null,
      products,
    });

    // Create the order
    // const order = new Order({
    //   ...orderDataFinal,
    //   // user: authUser.userId,
    // });

    const createdOrder = await order.save({ session });

    await createdOrder.populate("products.product");

    let result = createdOrder;

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    console.log(error);
    // Rollback the transaction in case of error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getMyShopOrders = async (
  query: Record<string, unknown>,
  authUser: IJwtPayload,
) => {
  // console.log("service query:", { query });
  // console.log("service authUser:", { authUser });

  const orderQuery = new QueryBuilder(
    Order.find().populate("products.product"),
    query,
  )
    .search(["user.name", "products.product.name"])
    .filter()
    .sort()
    .paginate()
    .fields();

  // const orderQuery = new QueryBuilder(Order.find(), query);

  const result = await orderQuery.modelQuery;
  // console.log("service result", { result });

  const meta = await orderQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getOrderDetails = async (orderId: string) => {
  const order = await Order.findById(orderId).populate(
    "user products.product coupon",
  );
  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, "Order not Found");
  }

  order.payment = await Payment.findOne({ order: order._id });
  return order;
};

const getMyOrders = async (
  query: Record<string, unknown>,
  authUser: IJwtPayload,
) => {
  const orderQuery = new QueryBuilder(
    Order.find({ user: authUser.userId }).populate(
      "user products.product coupon",
    ),
    query,
  )
    .search(["user.name", "user.email", "products.product.name"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await orderQuery.modelQuery;

  const meta = await orderQuery.countTotal();

  return {
    meta,
    result,
  };
};

const changeOrderStatus = async (
  orderId: string,
  status: string,
  authUser: IJwtPayload,
) => {
  const order = await Order.findOneAndUpdate(
    { _id: new Types.ObjectId(orderId) },
    { status },
    { new: true },
  );
  // console.log({ order });
  return order;
};

const changePaymentStatus = async (
  orderId: string,
  paymentStatus: string,
  authUser: IJwtPayload,
) => {
  const updatedOrder = await Order.findOneAndUpdate(
    { _id: new Types.ObjectId(orderId) },
    { paymentStatus },
    { new: true },
  );

  return updatedOrder;
};

export const OrderService = {
  createOrder,
  getMyShopOrders,
  getOrderDetails,
  getMyOrders,
  changeOrderStatus,
  changePaymentStatus,
};
