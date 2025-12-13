import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI as string;
import "../models";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const ConnectionStates = {
  disconnected: 0,
  connected: 1,
  connecting: 2,
  disconnecting: 3,
} as const;

let isConnecting = false;
let listenersInitialized = false;

const initializeListeners = () => {
  if (listenersInitialized) return;

  mongoose.connection.on("connected", () => {
    console.log("✅ Connected to MongoDB");
    isConnecting = false;
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB disconnected");
    isConnecting = false;
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
    isConnecting = false;
  });

  // Handle server selection timeout
  mongoose.connection.on("timeout", () => {
    console.error("⏱️ MongoDB connection timeout");
    isConnecting = false;
  });

  listenersInitialized = true;
};

// Function to verify connection is actually working
const verifyConnection = async (): Promise<boolean> => {
  try {
    // Ping the database with a short timeout
    await mongoose.connection.db?.admin().ping();
    return true;
  } catch (error) {
    console.error("Connection verification failed:", error);
    return false;
  }
};

export const dbConnect = async () => {
  initializeListeners();

  const currentState = mongoose.connection.readyState;

  // If connected, verify it's actually working
  if (currentState === ConnectionStates.connected) {
    const isValid = await verifyConnection();
    if (isValid) {
      return mongoose;
    } else {
      // Connection is stale, close and reconnect
      console.warn("⚠️ Connection is stale, reconnecting...");
      try {
        await mongoose.connection.close();
      } catch (err) {
        console.error("Error closing stale connection:", err);
      }
    }
  }

  // Already connecting - wait for it
  if (isConnecting || currentState === ConnectionStates.connecting) {
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max wait
    
    while (mongoose.connection.readyState === ConnectionStates.connecting && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (mongoose.connection.readyState === ConnectionStates.connected) {
      const isValid = await verifyConnection();
      if (isValid) return mongoose;
      // If not valid after connecting, fall through to reconnect
    }
  }

  // If disconnecting, wait for it to finish
  if (currentState === ConnectionStates.disconnecting) {
    await mongoose.connection.close();
  }

  isConnecting = true;

  try {
    const opts = {
      dbName: "devOverFlow",
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(MONGODB_URI, opts);
    isConnecting = false;
    
    // Verify the new connection works
    const isValid = await verifyConnection();
    if (!isValid) {
      throw new Error("Connection established but ping failed");
    }
    
    return mongoose;
  } catch (error) {
    isConnecting = false;
    throw error;
  }
};