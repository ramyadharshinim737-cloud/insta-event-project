// Database configuration and connection logic
import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // MongoDB connection options with better timeout handling
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
    });
    
    console.log("✓ MongoDB connected successfully");
    console.log(`✓ Database: ${mongoose.connection.name}`);
  } catch (error: any) {
    console.error("✗ MongoDB connection failed:", error.message);
    console.log("\n📝 Troubleshooting steps:");
    console.log("1. Check your internet connection");
    console.log("2. Verify MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)");
    console.log("3. Check if MONGO_URI in .env is correct");
    console.log("4. Try restarting the server\n");
    process.exit(1);
  }
};
