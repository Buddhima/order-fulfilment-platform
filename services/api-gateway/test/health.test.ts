import request from "supertest";

import { createApp } from "../src/index";

describe("health endpoint", () => {
  it("returns ok status", async () => {
    const app = await createApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("api-gateway");
  });
});
