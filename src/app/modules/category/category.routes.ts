import { Router } from "express";
import { multerUpload } from "../../config/multer.config";
import auth from "../../middleware/auth";
import { parseBody } from "../../middleware/bodyParser";
import validateRequest from "../../middleware/validateRequest";
import { UserRole } from "../user/user.interface";
import { CategoryController } from "./category.controller";
import { categoryValidation } from "./category.validation";

const router = Router();

router.get("/", CategoryController.getAllCategory);

router.post(
  "/",
  auth(UserRole.ADMIN),
  multerUpload.single("icon"),
  parseBody,
  validateRequest(categoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory
);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  multerUpload.single("icon"),
  parseBody,
  validateRequest(categoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory
);

router.delete("/:id", auth(UserRole.ADMIN), CategoryController.deleteCategory);

export const CategoryRoutes = router;
