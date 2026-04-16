import request from "supertest";


describe("Testing addition", () => {
  it("it should test addition", async () => {
    const sum = 1 + 2;
    expect(sum).toBe(3);
  });
});
