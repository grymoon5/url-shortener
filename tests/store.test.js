import { describe, expect, test } from "vitest"
import { generateCode } from "../src/store.js"

describe("generateCode", () => {
  test("generates a six-character code", () => {
    const code = generateCode()

    expect(code).toHaveLength(6)
  })

  test("generates only lowercase letters and numbers", () => {
    const code = generateCode()

    expect(code).toMatch(/^[a-z0-9]{6}$/)
  })

  test("usually generates different codes", () => {
    const firstCode = generateCode()
    const secondCode = generateCode()

    expect(firstCode).not.toBe(secondCode)
  })
})