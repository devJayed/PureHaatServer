import bcrypt from 'bcrypt';
import config from '../config';
import { UserRole } from '../modules/user/user.interface';
import User from '../modules/user/user.model';

const adminUser = {
    email: 'admin@gmail.com',
    password: "admin123",
    name: 'Admin',
    role: UserRole.ADMIN,
    clientInfo: {
        device: 'pc',
        browser: 'Unknown',
        ipAddress: '127.0.0.1',
        pcName: 'localhost',
        os: 'Unknown',
        userAgent: 'Seed Script',
    }
};
const deliveryUser = {
    email: 'delivery@gmail.com',
    password: "123456",
    name: 'Delivery',
    role: UserRole.DELIVERY,
    clientInfo: {
        device: 'pc',
        browser: 'Unknown',
        ipAddress: '127.0.0.1',
        pcName: 'localhost',
        os: 'Unknown',
        userAgent: 'Seed Script',
    }
};

const seedUser = async () => {
  try {
    // Check if an admin already exists
    const isAdminExist = await User.findOne({ role: UserRole.ADMIN });
    // Check if a delivery man already exists
    const isDeliveryExist = await User.findOne({ role: UserRole.DELIVERY });

    // Create admin if not exist
    if (!isAdminExist) {
      await User.create(adminUser);
      console.log("✅ Admin user created.");
    }

    // Create delivery user if not exist
    if (!isDeliveryExist) {
      await User.create(deliveryUser);
      console.log("✅ Delivery user created.");
    }

    if (isAdminExist && isDeliveryExist) {
      console.log("⚠️ Admin and Delivery users already exist.");
    }
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  }
};


export default seedUser;
