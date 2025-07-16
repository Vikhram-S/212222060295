import { Log } from "./logging-middleware"

export interface ShortUrl {
  id: string
  originalUrl: string
  shortCode: string
  customCode?: string
  createdAt: Date
  expiresAt: Date
  validityMinutes: number
  clickCount: number
  clicks: ClickData[]
}

export interface ClickData {
  timestamp: Date
  referrer: string
  location: string
  userAgent: string
}

class UrlStorage {
  private static instance: UrlStorage
  private storageKey = "shortened_urls"

  private constructor() {}

  static getInstance(): UrlStorage {
    if (!UrlStorage.instance) {
      UrlStorage.instance = new UrlStorage()
    }
    return UrlStorage.instance
  }

  getAllUrls(): ShortUrl[] {
    try {
      // Check if localStorage is available
      if (typeof window === "undefined" || !window.localStorage) {
        Log("frontend", "warn", "utils", "localStorage not available")
        return []
      }

      const stored = localStorage.getItem(this.storageKey)
      // Log raw stored data for debugging
      Log("frontend", "debug", "utils", `Raw stored data: ${stored}`)

      if (!stored) {
        Log("frontend", "info", "utils", "No URLs found in storage")
        return []
      }

      const parsed = JSON.parse(stored)
      Log("frontend", "debug", "utils", `Parsed data: ${JSON.stringify(parsed)}`)

      if (!Array.isArray(parsed)) {
        Log("frontend", "warn", "utils", "Invalid data format in storage, resetting")
        localStorage.removeItem(this.storageKey)
        return []
      }

      const urls = parsed
        .map((url: any) => {
          try {
            return {
              id: url.id || Date.now().toString(),
              originalUrl: url.originalUrl || "",
              shortCode: url.shortCode || "",
              customCode: url.customCode,
              createdAt: new Date(url.createdAt),
              expiresAt: new Date(url.expiresAt),
              validityMinutes: url.validityMinutes || 30,
              clickCount: url.clickCount || 0,
              clicks: (url.clicks || []).map((click: any) => ({
                timestamp: new Date(click.timestamp),
                referrer: click.referrer || "Direct",
                location: click.location || "Unknown",
                userAgent: click.userAgent || "",
              })),
            }
          } catch (error) {
            Log("frontend", "error", "utils", `Error parsing URL data: ${error}`)
            return null
          }
        })
        .filter(Boolean)

      Log("frontend", "debug", "utils", `Processed URLs: ${JSON.stringify(urls)}`)
      Log("frontend", "info", "utils", `Retrieved ${urls.length} URLs from storage`)
      return urls
    } catch (error) {
      Log("frontend", "error", "utils", `Failed to retrieve URLs: ${error}`)
      // Don't clear data on error, just return empty array
      return []
    }
  }

  saveUrl(url: ShortUrl): void {
    try {
      const urls = this.getAllUrls()
      urls.push(url)
      localStorage.setItem(this.storageKey, JSON.stringify(urls))
      Log("frontend", "info", "utils", `Saved URL with shortcode: ${url.shortCode}`)
    } catch (error) {
      Log("frontend", "error", "utils", `Failed to save URL: ${error}`)
    }
  }

  findByShortCode(shortCode: string): ShortUrl | null {
    try {
      const urls = this.getAllUrls()
      const url = urls.find((u) => u.shortCode === shortCode)

      if (url) {
        Log("frontend", "info", "utils", `Found URL for shortcode: ${shortCode}`)
      } else {
        Log("frontend", "warn", "utils", `No URL found for shortcode: ${shortCode}`)
      }

      return url || null
    } catch (error) {
      Log("frontend", "error", "utils", `Error finding URL by shortcode: ${error}`)
      return null
    }
  }

  updateUrl(url: ShortUrl): void {
    try {
      const urls = this.getAllUrls()
      const index = urls.findIndex((u) => u.id === url.id)

      if (index !== -1) {
        urls[index] = url
        localStorage.setItem(this.storageKey, JSON.stringify(urls))
        Log("frontend", "info", "utils", `Updated URL: ${url.shortCode}`)
      }
    } catch (error) {
      Log("frontend", "error", "utils", `Failed to update URL: ${error}`)
    }
  }

  isShortCodeUnique(shortCode: string): boolean {
    const urls = this.getAllUrls()
    const isUnique = !urls.some((u) => u.shortCode === shortCode)

    if (!isUnique) {
      Log("frontend", "warn", "utils", `Shortcode collision detected: ${shortCode}`)
    }

    return isUnique
  }

  generateUniqueShortCode(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""

    do {
      result = ""
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
    } while (!this.isShortCodeUnique(result))

    Log("frontend", "info", "utils", `Generated unique shortcode: ${result}`)
    return result
  }

  isUrlExpired(url: ShortUrl): boolean {
    const expired = new Date() > url.expiresAt
    if (expired) {
      Log("frontend", "info", "utils", `URL expired: ${url.shortCode}`)
    }
    return expired
  }

  recordClick(shortCode: string, referrer = "", userAgent = ""): void {
    try {
      const url = this.findByShortCode(shortCode)
      if (!url) return

      const clickData: ClickData = {
        timestamp: new Date(),
        referrer: referrer || "Direct",
        location: "Unknown", // In a real app, you'd use geolocation API
        userAgent: userAgent || navigator.userAgent,
      }

      url.clicks.push(clickData)
      url.clickCount = url.clicks.length
      this.updateUrl(url)

      Log("frontend", "info", "utils", `Recorded click for: ${shortCode}`)
    } catch (error) {
      Log("frontend", "error", "utils", `Failed to record click: ${error}`)
    }
  }

  clearAllData(): void {
    try {
      localStorage.removeItem(this.storageKey)
      Log("frontend", "info", "utils", "Cleared all URL data")
    } catch (error) {
      Log("frontend", "error", "utils", `Failed to clear data: ${error}`)
    }
  }
}

export default UrlStorage
