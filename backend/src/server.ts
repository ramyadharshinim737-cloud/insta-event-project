// Server startup
// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app";
import { connectDB } from "./config/db";
import { initializeSocket } from "./socket/socket";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initializeSocket(httpServer);

    // Start server - Listen on all network interfaces (0.0.0.0)
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Socket.IO initialized`);
      console.log(`✓ Accessible at http://localhost:${PORT}`);
      console.log(`✓ PRIMARY: http://10.90.116.188:${PORT} (Wi-Fi) ⭐`);
      console.log(`✓ Accessible at http://192.168.56.1:${PORT} (Ethernet)`);
      console.log(`✓ Accessible at http://10.0.2.2:${PORT} (Android Emulator)`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
