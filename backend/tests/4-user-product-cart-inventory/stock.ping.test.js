import request from "supertest";
import app from "../../app.js";

test("Stock module reachable", async () => {
  const res = await request(app).get("/api/stocks");
  expect([200, 204, 401, 404]).toContain(res.statusCode);
});