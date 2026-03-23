import request from "supertest";
import app from "../src/app";

describe("GET /", () => {
  it("should return backend running message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toBe("Backend is running successfully!");
  });
});
