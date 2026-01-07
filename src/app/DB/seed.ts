import bcrypt from "bcrypt";
import { UserRole } from "../modules/user/user.interface";
import User from "../modules/user/user.model";

export const seedUser = async (): Promise<void> => {
  try {
    // console.log("🌱 Seeding users...");
    const isAdminExist = await User.findOne({ role: UserRole.ADMIN });
    const isDeliveryExist = await User.findOne({ role: UserRole.DELIVERY });

    if (!isAdminExist) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        email: "admin@gmail.com",
        password: hashedPassword,
        name: "Admin",
        role: UserRole.ADMIN,
        clientInfo: {
          device: "pc",
          browser: "Unknown",
          ipAddress: "127.0.0.1",
          pcName: "localhost",
          os: "Unknown",
          userAgent: "Seed Script",
        },
      });

      // console.log("✅ Admin user created");
    }

    if (!isDeliveryExist) {
      const hashedPassword = await bcrypt.hash("123456", 10);

      await User.create({
        email: "delivery@gmail.com",
        password: hashedPassword,
        name: "Delivery",
        role: UserRole.DELIVERY,
        clientInfo: {
          device: "pc",
          browser: "Unknown",
          ipAddress: "127.0.0.1",
          pcName: "localhost",
          os: "Unknown",
          userAgent: "Seed Script",
        },
      });

      // console.log("✅ Delivery user created");
    }

    if (isAdminExist && isDeliveryExist) {
      // console.log("ℹ️ Admin & Delivery users already exist");
    }
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
};
