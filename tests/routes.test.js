import { beforeAll, describe, expect, test, vi } from "vitest"
import request from "supertest"

vi.mock("../src/database.js", () => ({
  database: {},
}))

let app
let database

beforeAll(async () => {
  const databaseModule = await import("../src/database.js")
  const appModule = await import("../src/app.js")
  database = databaseModule.database
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

  test("POST /api/links creates a short URL", async () => {
    database.from = vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }))

    const response = await request(app)
      .post("/api/links")
      .send({ url: "https://example.com/a/long/path" })

    expect(response.status).toBe(201)
    expect(response.body.code).toMatch(/^[a-z0-9]{6}$/)
    expect(response.body.originalUrl).toBe("https://example.com/a/long/path")
    expect(response.body.shortUrl.endsWith(`/${response.body.code}`)).toBe(true)
    expect(database.from).toHaveBeenCalledWith("links")
  })

  test("GET /:code redirects to the stored URL", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { original_url: "https://example.com/destination" },
      error: null,
    })
    const eq = vi.fn(() => ({ maybeSingle }))
    const select = vi.fn(() => ({ eq }))
    database.from = vi.fn(() => ({ select }))

    const response = await request(app).get("/abc123")

    expect(response.status).toBe(302)
    expect(response.headers.location).toBe("https://example.com/destination")
    expect(database.from).toHaveBeenCalledWith("links")
    expect(select).toHaveBeenCalledWith("original_url")
    expect(eq).toHaveBeenCalledWith("code", "abc123")
  })
})
