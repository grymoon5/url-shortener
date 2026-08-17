import express from "express"
import { generateCode, links } from "./store.js"

export const app = express()

app.use(express.json())
app.use(express.static("public"))

app.get("/health", (request, response) => {
  response.json({ status: "ok" })
})

app.post("/api/links", (request, response) => {
    const {url, customCode } = request.body

    if (!url) {
        return response.status(400).json({
            error: "Please provide the correct URL.",
        })
    }

    let code = customCode || generateCode

    while (links.has(code)) {
        if (customCode) {
            return response.status(409).json({
                error:"The code has already been used"
            })
        }

        code = generateCode()
    }

    links.set(code,url)

    const baseUrl = process.env.baseUrl
})

