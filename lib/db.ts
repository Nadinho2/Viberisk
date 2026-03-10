import mongoose from "mongoose";
import { env } from "./env";

const MONGODB_URL = env.dbUri;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = global as typeof global & {
  _mongoose?: MongooseCache;
};

if (!globalWithMongoose._mongoose) {
  globalWithMongoose._mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose._mongoose as MongooseCache;

export async function connectDb(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

