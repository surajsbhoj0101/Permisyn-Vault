import request from "supertest";
jest.mock("../src/routes/auth.routes", () => {
  const express = require("express");
  return {
    __esModule: true,
    default: express.Router(),
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
