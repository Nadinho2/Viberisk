import mongoose from "mongoose";
import { env } from "./env";

export const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(env.dbUri);
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error", error);
    process.exit(1);
  }
};
