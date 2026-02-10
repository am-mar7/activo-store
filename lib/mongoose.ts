import mongoose from "mongoose";
import "../models";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: CachedConnection | undefined;
}

// Initialize cache
if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

const opts = {
  dbName: "Activo",
  bufferCommands: false,
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 120000,
  connectTimeoutMS: 30000,
  family: 4,
  retryWrites: true,
  retryReads: true,
  heartbeatFrequencyMS: 10000,
  maxIdleTimeMS: 60000,
} as const;

const connectWithRetry = async (): Promise<typeof mongoose> => {
  try {
    return await mongoose.connect(MONGODB_URI, opts);
  } catch (err) {
    console.error("MongoDB connection failed, retrying once...", err);
    // Retry once
    return await mongoose.connect(MONGODB_URI, opts);
  }
};

export const dbConnect = async (): Promise<typeof mongoose> => {
  // Return cached connection if available
  if (global.mongooseCache!.conn) {
    return global.mongooseCache!.conn;
  }

  // If already connecting, wait for that promise
  if (global.mongooseCache!.promise) {
    return global.mongooseCache!.promise;
  }

  // Development logging (only set once)
  if (
    process.env.NODE_ENV === "development" &&
    !mongoose.connection.listenerCount("connected")
  ) {
    mongoose.connection.on("connected", () =>
      console.log("✅ Connected to MongoDB")
    );
    mongoose.connection.on("error", (err) =>
      console.error("❌ MongoDB error:", err)
    );
    mongoose.connection.on("disconnected", () =>
      console.warn("⚠️ MongoDB disconnected")
    );
  }

  // Create and cache the connection promise
  global.mongooseCache!.promise = connectWithRetry()
    .then((conn) => {
      global.mongooseCache!.conn = conn;
      return conn;
    })
    .catch((err) => {
      global.mongooseCache!.promise = null; // Clear failed promise
      throw new Error(`MongoDB connection failed: ${err}`);
    });

  return global.mongooseCache!.promise;
};
