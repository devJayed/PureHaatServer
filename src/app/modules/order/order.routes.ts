import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { OrderController } from "./order.controller";

const router = Router();

router.get(
  "/my-shop-orders",
  auth(UserRole.DELIVERY, UserRole.ADMIN),
  OrderController.getMyShopOrders
);

// router.get(
//     '/my-orders',
//     auth(UserRole.USER, UserRole.ADMIN),
//     OrderController.getMyOrders
// );

router.get(
  "/:orderId",
  // auth(UserRole.USER),
  auth(UserRole.USER, UserRole.ADMIN, UserRole.DELIVERY),
  OrderController.getOrderDetails
);

router.post(
  "/",
  // auth(UserRole.USER),
  OrderController.createOrder
);
// order status change route for Moderator and Admin only
router.patch(
  "/:orderId/status",
  auth(UserRole.ADMIN),
  OrderController.changeOrderStatus
);
// delivery route for deliveryMan and Admin only
router.patch(
  "/:orderId/payment-status",
  auth(UserRole.DELIVERY),
  OrderController.changePaymentStatus
);

export const OrderRoutes = router;
