import mongoose from "mongoose";
import { requireEnv } from "../lib/require-env.js";

export async function connectMongoDB(): Promise<void> {
  const uri = requireEnv("MONGODB_URI");

  mongoose.connection.on("connected", () => console.log("[mongodb] connection established"));
  mongoose.connection.on("error", (error: Error) => console.error("[mongodb] connection error:", error.message));
  mongoose.connection.on("disconnected", () => console.warn("[mongodb] connection lost"));

  await mongoose.connect(uri);
}

export async function disconnectMongoDB(): Promise<void> {
  await mongoose.connection.close();
}
