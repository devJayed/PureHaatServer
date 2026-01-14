import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IJwtPayload } from "../auth/auth.interface";
import { OrderService } from "./order.service";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.createOrder(
    req.body
    // req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

const getMyShopOrders = catchAsync(async (req: Request, res: Response) => {
  // console.log("order req query:", req.query);
  // console.log("order req user:", req.user);
  const result = await OrderService.getMyShopOrders(
    req.query,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrive successfully",
    data: result.result,
    meta: result.meta,
  });
});

const getOrderDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getOrderDetails(req.params.orderId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrive succesfully",
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getMyOrders(
    req.query,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order retrive succesfully",
    data: result.result,
    meta: result.meta,
  });
});

const changeOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await OrderService.changeOrderStatus(
    req.params.orderId,
    status,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Order status changed successfully",
    data: result,
  });
});

const changePaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { paymentStatus } = req.body;
  const result = await OrderService.changePaymentStatus(
    req.params.orderId,
    paymentStatus,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment status changed successfully",
    data: result,
  });
});

export const OrderController = {
  createOrder,
  getMyShopOrders,
  getOrderDetails,
  getMyOrders,
  changeOrderStatus,
  changePaymentStatus,
};
