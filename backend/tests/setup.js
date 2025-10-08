import "dotenv/config";      // load biến từ backend/.env
import mongoose from "mongoose";

beforeAll(async () => {
  const uri =
    process.env.MONGODB_URI_TEST ||    // DB test riêng (khuyến nghị)
    process.env.MONGODB_URI ||         // fallback: DB dev/prod
    "mongodb://localhost:27017/app-test";

  // Nếu là Atlas (mongodb+srv) thì không cần dbName; nếu local thì gán dbName
  const opts = uri.startsWith("mongodb+srv") ? {} : { dbName: "app-test" };
  await mongoose.connect(uri, opts);
});

afterAll(async () => {
  try { await mongoose.connection.dropDatabase(); } catch {}
  await mongoose.connection.close();
});