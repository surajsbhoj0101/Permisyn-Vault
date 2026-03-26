import request from "supertest";
jest.mock("../src/routes/auth.routes", () => {
  return {
    __esModule: true,
    default: (_req: unknown, _res: unknown, next: () => void) => next(),
  };
});

import app from "../src/app";

describe("GET /", () => {
  it("should return backend running message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toBe("Backend is running successfully!");
  });
});
