// stores unique values and provides a quick way to check whether one exists

const reservedCodes = new Set([
  "api",
  "health",
])

// checks original value
export function validateUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return {
      valid: false,
      error: "Please provide a URL.",
    }
  }

  try {
    const url = new URL(value.trim())

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return {
        valid: false,
        error: "URL must begin with http:// or https://.",
      }
    }

    return {
      valid: true,
      value: url.toString(),
    }
  } catch {
    return {
      valid: false,
      error: "Please enter a valid URL.",
    }
  }
}

export function validateCode(value) {
  if (!value) {
    return {
      valid: true,
      value: null,
    }
  }

  const code = value.trim().toLowerCase()

  if (code.length < 3 || code.length > 30) {
    return {
      valid: false,
      error: "Custom code must contain 3–30 characters.",
    }
  }

  if (!/^[a-z0-9_-]+$/.test(code)) {
    return {
      valid: false,
      error: "Use only letters, numbers, hyphens, and underscores.",
    }
  }

  if (reservedCodes.has(code)) {
    return {
      valid: false,
      error: "That custom code is reserved.",
    }
  }

  return {
    valid: true,
    value: code,
  }
}