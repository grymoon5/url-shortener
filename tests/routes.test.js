import { beforeAll, describe, expect, test, vi } from "vitest"
import request from "supertest"

vi.mock("../src/database.js", () => ({
  database: {},
}))

let app

beforeAll(async () => {
  const appModule = await import("../src/app.js")
  app = appModule.app
})

describe("application routes", () => {
  test("GET /health returns an operational status", async () => {
    const response = await request(app).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: "ok",
    })
  })

  test("POST /api/links rejects a missing URL", async () => {
    const response = await request(app)
      .post("/api/links")
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.error).toBeDefined()
  })

  test("POST /api/links rejects an invalid URL", async () => {
    const response = await request(app)
      .post("/api/links")
      .send({
        url: "not a valid URL",
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toBeDefined()
  })
})