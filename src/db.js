// /lib/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI manquant dans .env");
}

let cached = (global)._mongoose;
if (!cached) {
  cached = (global)._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "soiree-entrepreneur",
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
