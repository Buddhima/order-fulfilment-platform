import type { Express } from "express";

export function registerHealthRoute(app: Express): void {
  app.get("/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      service: "api-gateway",
      timestamp: new Date().toISOString(),
    });
  });
}
