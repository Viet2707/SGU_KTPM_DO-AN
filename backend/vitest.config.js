import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["tests/setup.js"],
    globals: true, // <-- thêm dòng này để dùng beforeAll/afterAll mà không cần import
  },
});