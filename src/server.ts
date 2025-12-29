import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";

let server: Server | null = null;

mongoose.set("bufferCommands", false);

// Database connection
async function connectToDatabase() {
  try {
    await mongoose.connect(config.db_url as string, {
      maxPoolSize: 10, // connection pool
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("🛢 Database connected successfully");
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Closing server...`);

  try {
    await mongoose.connection.close();
    console.log("🛢 MongoDB connection closed");
  } catch (err) {
    console.error("Error closing DB:", err);
  }

  if (server) {
    server.close(() => {
      console.log("Server closed gracefully");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// Application bootstrap
async function bootstrap() {
  try {
    await connectToDatabase();
    //await seed();

    server = app.listen(config.port, () => {
      console.log(`🚀 Application is running on port ${config.port}`);
    });

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Error handling
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (error) => {
      console.error("Unhandled Rejection:", error);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("Error during bootstrap:", error);
    process.exit(1);
  }
}

// Start the application
bootstrap();
