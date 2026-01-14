import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { IImageFile } from "../../interface/IImageFile";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { IJwtPayload } from "../auth/auth.interface";
import { CategoryService } from "./category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(
    req.body,
    req.file as IImageFile,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategory = catchAsync(async (req, res) => {
  const result = await CategoryService.getAllCategory(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Category are retrieved successfully",
    meta: result.meta,
    data: result.result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryService.updateCategoryIntoDB(
    id,
    req.body,
    req.file as IImageFile,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "category is updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CategoryService.deleteCategoryIntoDB(
    id,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Category is deleted successfully",
    data: result,
  });
});

export const CategoryController = {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
};
