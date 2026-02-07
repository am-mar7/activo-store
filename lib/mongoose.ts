import mongoose from "mongoose";
import "../models";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

interface CachedConnection {
  conn: typeof mongoose | null;
}

declare global {
  var mongooseCache: CachedConnection;
}

const opts = {
  dbName: "Activo",
  bufferCommands: false,
  maxPoolSize: 20,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  retryReads: true,
};

export const dbConnect = async () => {
  if (global.mongooseCache?.conn) return global.mongooseCache.conn;

  if (process.env.NODE_ENV === "development") {
    mongoose.connection.once("connected", () =>
      console.log("✅ Connected to MongoDB")
    );
    mongoose.connection.once("error", (err) =>
      console.error("❌ MongoDB error:", err)
    );
    mongoose.connection.once("disconnected", () =>
      console.warn("⚠️ MongoDB disconnected")
    );
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, opts);
    global.mongooseCache = { conn }; // cache only successful connection
    return conn;
  } catch (err) {
    console.error("MongoDB initial connection failed, retrying once...", err);

    try {
      const conn = await mongoose.connect(MONGODB_URI, opts);
      global.mongooseCache = { conn };
      return conn;
    } catch (retryErr) {
      throw new Error("Connection failed with: " + retryErr);
    }
  }
};
