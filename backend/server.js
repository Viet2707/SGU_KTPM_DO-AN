import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

dotenv.config();

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/plantshop";

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
  })
  .catch(err => {
    console.error("❌ DB Connect Error:", err);
    process.exit(1);
  });