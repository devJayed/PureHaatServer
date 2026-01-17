import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { seedUser } from "./app/DB/seed";

let server: Server | null = null;

// Fail fast if DB is not connected
mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 0);

// Database connection
async function connectToDatabase() {
  try {
    await mongoose.connect(config.db_url as string, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("🛢 Database connected successfully");
  } catch (err) {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`📴 Received ${signal}. Shutting down...`);

  try {
    await mongoose.connection.close();
    console.log("🛢 MongoDB connection closed");
  } catch (err) {
    console.error("❌ Error closing DB:", err);
  }

  if (server) {
    server.close(() => {
      console.log("🚪 Server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// Application bootstrap
async function bootstrap() {
  try {
    // 1️⃣ Connect DB
    await connectToDatabase();

    // 2️⃣ Seed AFTER DB is ready
    await seedUser();

    // 3️⃣ Start server
    server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
    });

    // Signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (error) => {
      console.error("❌ Unhandled Rejection:", error);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("❌ Bootstrap error:", error);
    process.exit(1);
  }
}

// Start app
bootstrap();
