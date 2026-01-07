import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/appError";
import { IImageFile } from "../../interface/IImageFile";
import { IJwtPayload } from "../auth/auth.interface";
import { AuthService } from "../auth/auth.service";
import { ICustomer } from "../customer/customer.interface";
import Customer from "../customer/customer.model";
import { UserSearchableFields } from "./user.constant";
import { IUser, UserRole } from "./user.interface";
import User from "./user.model";

// Function to register user
const registerUser = async (userData: IUser) => {
  const session = await mongoose.startSession();

  // console.log("Service user data: ", { userData });
  try {
    session.startTransaction();
    // Validate user role (no need I think, since only USER role is allowed from frontend by default)
    if ([UserRole.ADMIN, UserRole.DELIVERY].includes(userData.role)) {
      throw new AppError(
        StatusCodes.NOT_ACCEPTABLE,
        "Invalid role. Only User is allowed."
      );
    }

    // Check if the user already exists by email
    const existingUser = await User.findOne({ email: userData.email }).session(
      session
    );
    if (existingUser) {
      throw new AppError(
        StatusCodes.NOT_ACCEPTABLE,
        "Email is already registered"
      );
    }

    // Create the user
    const user = new User(userData);
    // console.log("service user: ", { user });
    const createdUser = await user.save({ session });

    // Create the customer profile (others information will be provided later with edit profile and name, mobile number can be taken from checkout form)
    const profile = new Customer({
      user: createdUser._id,
    });

    // console.log("service customer: ", { profile });

    await profile.save({ session });

    await session.commitTransaction();

    return await AuthService.loginUser({
      email: createdUser.email,
      password: userData.password,
      clientInfo: userData.clientInfo,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const getAllUser = async (query: Record<string, unknown>) => {
  const UserQuery = new QueryBuilder(User.find(), query)
    .search(UserSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await UserQuery.modelQuery;
  const meta = await UserQuery.countTotal();
  return {
    result,
    meta,
  };
};

const myProfile = async (authUser: IJwtPayload) => {
  const isUserExists = await User.findById(authUser.userId);
  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }
  if (!isUserExists.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not active!");
  }

  const profile = await Customer.findOne({ user: isUserExists._id });

  return {
    ...isUserExists.toObject(),
    profile: profile || null,
  };
};

const updateProfile = async (
  payload: Partial<ICustomer>,
  file: IImageFile,
  authUser: IJwtPayload
) => {
  const isUserExists = await User.findById(authUser.userId);

  if (!isUserExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }
  if (!isUserExists.isActive) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not active!");
  }

  if (file && file.path) {
    payload.photo = file.path;
  }

  const result = await Customer.findOneAndUpdate(
    { user: authUser.userId },
    payload,
    {
      new: true,
    }
  ).populate("user");

  return result;
};

const updateUserStatus = async (userId: string) => {
  const user = await User.findById(userId);

  // console.log('comes here');
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User is not found");
  }

  user.isActive = !user.isActive;
  const updatedUser = await user.save();
  return updatedUser;
};

export const UserServices = {
  registerUser,
  getAllUser,
  myProfile,
  updateUserStatus,
  updateProfile,
};
