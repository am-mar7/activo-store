import mongoose from "mongoose";
import "../models";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: CachedConnection | undefined;
}

const cache: CachedConnection =
  global.mongooseCache ?? {
    conn: null,
    promise: null,
  };

global.mongooseCache = cache;

const opts: mongoose.ConnectOptions = {
  dbName: "Activo",
  bufferCommands: false,
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 20000,
  connectTimeoutMS: 20000,
  socketTimeoutMS: 60000,
  family: 4,
};

export const dbConnect = async (): Promise<typeof mongoose> => {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        cache.conn = mongooseInstance;
        return mongooseInstance;
      })
      .catch((error) => {
        cache.promise = null;
        throw error;
      });
  }

  return cache.promise;
};