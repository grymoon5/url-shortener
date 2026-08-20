import express from "express"
import { database } from "./database.js"
import { validateUrl } from "./validation.js"
import { generateCode } from "./store.js"

export const app = express()

app.use(express.json())
app.use(express.static("public"))

app.get("/health", (request, response) => {
  response.json({ 
    status: "ok",
    })
})

//create a short link
app.post("/api/links", async (request, response) => {
  try {
    const validation = validateUrl(request.body.url)

    if (!validation.valid) {
      return response.status(400).json({
        error: validation.error,
      })
    }

    const originalUrl = validation.value

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateCode()

      const { error } = await database
        .from("links")
        .insert({
          code,
          original_url: originalUrl,
        })

      if (!error) {
        const baseUrl =
          process.env.BASE_URL ||
          `${request.protocol}://${request.get("host")}`

        return response.status(201).json({
          code,
          originalUrl,
          shortUrl: `${baseUrl}/${code}`,
        })
      }

      if (error.code !== "23505") {
        console.error("Unable to save short link:", error)

        return response.status(500).json({
          error: "Unable to create the short URL.",
        })
      }
    }

    return response.status(503).json({
      error: "Unable to generate a unique short code.",
    })
  } catch (error) {
    console.error("Unexpected creation error:", error)

    return response.status(500).json({
      error: "An unexpected server error occurred.",
    })
  }
})

// Redirect a short link to the original URL
app.get("/:code", async (request, response) => {
  try {
    const { code } = request.params

    const { data, error } = await database
      .from("links")
      .select("original_url")
      .eq("code", code)
      .maybeSingle()

    if (error) {
      console.error("Supabase lookup error:", error)

      return response.status(500).json({
        error: "The short URL could not be retrieved.",
      })
    }

    if (!data) {
      return response.status(404).json({
        error: "Short URL not found.",
      })
    }

    return response.redirect(302, data.original_url)
  } catch (error) {
    console.error("Unexpected redirect error:", error)

    return response.status(500).json({
      error: "An unexpected server error occurred.",
    })
  }
})