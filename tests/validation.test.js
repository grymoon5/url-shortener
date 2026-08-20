import { describe, expect, test } from "vitest"
import { validateUrl } from "../src/validation.js"

describe("validateUrl", () => {
  test("accepts a valid HTTPS URL", () => {
    const result = validateUrl("https://example.com")

    expect(result.valid).toBe(true)
    expect(result.value).toBe("https://example.com/")
  })

  test("accepts a valid HTTP URL", () => {
    const result = validateUrl("http://example.com")

    expect(result.valid).toBe(true)
  })

  test("rejects an empty value", () => {
    const result = validateUrl("")

    expect(result.valid).toBe(false)
  })

  test("rejects malformed URLs", () => {
    const result = validateUrl("this is not a URL")

    expect(result.valid).toBe(false)
  })

  test("rejects non-HTTP protocols", () => {
    const result = validateUrl("ftp://example.com")

    expect(result.valid).toBe(false)
  })
})