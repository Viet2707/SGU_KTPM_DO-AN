import "dotenv/config";
import mongoose from "mongoose";

beforeAll(async () => {
  const uri =
    process.env.MONGODB_URI_TEST ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/app-test";

  const opts = uri.startsWith("mongodb+srv") ? {} : { dbName: "app-test" };
  await mongoose.connect(uri, opts);
});

beforeEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  try { await mongoose.connection.dropDatabase(); } catch { }
  await mongoose.connection.close();
});