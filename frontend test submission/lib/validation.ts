import { Log } from "./logging-middleware"

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const validateUrl = (url: string): ValidationResult => {
  Log("frontend", "debug", "utils", `Validating URL: ${url}`)

  if (!url.trim()) {
    Log("frontend", "warn", "utils", "URL validation failed: empty URL")
    return { isValid: false, error: "URL is required" }
  }

  try {
    const urlObj = new URL(url)
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      Log("frontend", "warn", "utils", "URL validation failed: invalid protocol")
      return { isValid: false, error: "URL must start with http:// or https://" }
    }

    Log("frontend", "info", "utils", "URL validation passed")
    return { isValid: true }
  } catch (error) {
    Log("frontend", "warn", "utils", `URL validation failed: ${error}`)
    return { isValid: false, error: "Please enter a valid URL" }
  }
}

export const validateShortCode = (shortCode: string): ValidationResult => {
  Log("frontend", "debug", "utils", `Validating shortcode: ${shortCode}`)

  if (!shortCode.trim()) {
    return { isValid: true } // Optional field
  }

  if (shortCode.length < 3 || shortCode.length > 20) {
    Log("frontend", "warn", "utils", "Shortcode validation failed: invalid length")
    return { isValid: false, error: "Shortcode must be 3-20 characters long" }
  }

  if (!/^[a-zA-Z0-9]+$/.test(shortCode)) {
    Log("frontend", "warn", "utils", "Shortcode validation failed: invalid characters")
    return { isValid: false, error: "Shortcode can only contain letters and numbers" }
  }

  Log("frontend", "info", "utils", "Shortcode validation passed")
  return { isValid: true }
}

export const validateValidity = (validity: string): ValidationResult => {
  Log("frontend", "debug", "utils", `Validating validity: ${validity}`)

  if (!validity.trim()) {
    return { isValid: true } // Will use default
  }

  const num = Number.parseInt(validity)
  if (isNaN(num) || num <= 0) {
    Log("frontend", "warn", "utils", "Validity validation failed: invalid number")
    return { isValid: false, error: "Validity must be a positive number" }
  }

  if (num > 10080) {
    // 1 week in minutes
    Log("frontend", "warn", "utils", "Validity validation failed: too long")
    return { isValid: false, error: "Validity cannot exceed 1 week (10080 minutes)" }
  }

  Log("frontend", "info", "utils", "Validity validation passed")
  return { isValid: true }
}
