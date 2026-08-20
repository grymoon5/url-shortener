const RECENT_LINKS_KEY = "linkly-recent-links"
const THEME_KEY = "linkly-theme"

const form = document.querySelector("#shorten-form")
const formView = document.querySelector("#form-view")
const errorMessage = document.querySelector("#error")
const result = document.querySelector("#result")
const originalUrlLink = document.querySelector("#original-url")
const shortUrlLink = document.querySelector("#short-url")
const submitButton = document.querySelector("#submit-button")
const copyResultButton = document.querySelector("#copy-result")
const shortenAnotherButton = document.querySelector("#shorten-another")
const recentLinksContainer = document.querySelector("#recent-links")
const emptyRecent = document.querySelector("#empty-recent")
const clearRecentButton = document.querySelector("#clear-recent")
const themeToggle = document.querySelector("#theme-toggle")

let recentLinks = readRecentLinks()

function readRecentLinks() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_LINKS_KEY)) || []
  } catch {
    return []
  }
}

function saveRecentLink(link) {
  recentLinks = [link, ...recentLinks.filter((item) => item.shortUrl !== link.shortUrl)].slice(0, 8)
  localStorage.setItem(RECENT_LINKS_KEY, JSON.stringify(recentLinks))
  renderRecentLinks()
}

function createRecentCard(link) {
  const card = document.createElement("article")
  card.className = "recent-card"

  const linkCopy = document.createElement("div")
  linkCopy.className = "recent-copy"

  const shortLink = document.createElement("a")
  shortLink.className = "recent-short"
  shortLink.href = link.shortUrl
  shortLink.target = "_blank"
  shortLink.rel = "noopener noreferrer"
  shortLink.textContent = link.shortUrl

  const originalLink = document.createElement("span")
  originalLink.className = "recent-original"
  originalLink.title = link.originalUrl
  originalLink.textContent = link.originalUrl

  const actions = document.createElement("div")
  actions.className = "recent-actions"

  const visitLink = document.createElement("a")
  visitLink.className = "action-button"
  visitLink.href = link.shortUrl
  visitLink.target = "_blank"
  visitLink.rel = "noopener noreferrer"
  visitLink.textContent = "Visit URL ↗"

  const copyButton = document.createElement("button")
  copyButton.className = "action-button secondary"
  copyButton.type = "button"
  copyButton.textContent = "Copy"
  copyButton.addEventListener("click", () => copyText(link.shortUrl, copyButton))

  linkCopy.append(shortLink, originalLink)
  actions.append(visitLink, copyButton)
  card.append(linkCopy, actions)
  return card
}

function renderRecentLinks() {
  recentLinksContainer.replaceChildren(...recentLinks.map(createRecentCard))
  emptyRecent.hidden = recentLinks.length > 0
  clearRecentButton.hidden = recentLinks.length === 0
}

async function copyText(text, button) {
  const previousLabel = button.textContent

  try {
    await navigator.clipboard.writeText(text)
    button.textContent = "Copied!"
  } catch {
    button.textContent = "Copy failed"
  }

  window.setTimeout(() => {
    button.textContent = previousLabel
  }, 1600)
}

function showResult(link) {
  originalUrlLink.href = link.originalUrl
  originalUrlLink.textContent = link.originalUrl
  shortUrlLink.href = link.shortUrl
  shortUrlLink.textContent = link.shortUrl
  formView.hidden = true
  result.hidden = false
}

function resetForm() {
  form.reset()
  result.hidden = true
  formView.hidden = false
  errorMessage.textContent = ""
  document.querySelector("#url").focus()
}

form.addEventListener("submit", async (event) => {
  event.preventDefault()
  errorMessage.textContent = ""
  submitButton.disabled = true
  submitButton.textContent = "Creating..."

  const originalUrl = document.querySelector("#url").value

  try {
    const response = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: originalUrl }),
    })
    const data = await response.json()

    if (!response.ok) {
      errorMessage.textContent = data.error || "Unable to create the short URL."
      return
    }

    const link = { originalUrl: data.originalUrl, shortUrl: data.shortUrl }
    showResult(link)
    saveRecentLink(link)
  } catch (error) {
    console.error("Frontend request failed:", error)
    errorMessage.textContent = "Unable to contact the server. Please try again."
  } finally {
    submitButton.disabled = false
    submitButton.textContent = "Shorten URL"
  }
})

copyResultButton.addEventListener("click", () => copyText(shortUrlLink.href, copyResultButton))
shortenAnotherButton.addEventListener("click", resetForm)

clearRecentButton.addEventListener("click", () => {
  recentLinks = []
  localStorage.removeItem(RECENT_LINKS_KEY)
  renderRecentLinks()
})

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  const darkMode = theme === "dark"
  themeToggle.firstElementChild.textContent = darkMode ? "☀" : "☾"
  themeToggle.setAttribute("aria-label", darkMode ? "Switch to light mode" : "Switch to dark mode")
}

const savedTheme = localStorage.getItem(THEME_KEY)
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
applyTheme(savedTheme || preferredTheme)

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"
  localStorage.setItem(THEME_KEY, nextTheme)
  applyTheme(nextTheme)
})

renderRecentLinks()
