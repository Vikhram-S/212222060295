"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, TextField, Button, Typography, Box, Alert, Grid, IconButton } from "@mui/material"
import { Add, Delete, Link as LinkIcon, Schedule, Code } from "@mui/icons-material"
import { Log } from "../lib/logging-middleware"
import { validateUrl, validateShortCode, validateValidity } from "../lib/validation"
import UrlStorage, { type ShortUrl } from "../lib/url-storage"

interface UrlFormData {
  id: string
  originalUrl: string
  customCode: string
  validity: string
  error?: string
}

interface Props {
  onUrlsCreated: (urls: ShortUrl[]) => void
}

const UrlForm: React.FC<Props> = ({ onUrlsCreated }) => {
  const [forms, setForms] = useState<UrlFormData[]>([{ id: "1", originalUrl: "", customCode: "", validity: "" }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string>("")

  const urlStorage = UrlStorage.getInstance()

  const addForm = () => {
    if (forms.length < 5) {
      const newForm: UrlFormData = {
        id: Date.now().toString(),
        originalUrl: "",
        customCode: "",
        validity: "",
      }
      setForms([...forms, newForm])
      Log("frontend", "info", "component", `Added new URL form. Total forms: ${forms.length + 1}`)
    }
  }

  const removeForm = (id: string) => {
    if (forms.length > 1) {
      setForms(forms.filter((form) => form.id !== id))
      Log("frontend", "info", "component", `Removed URL form. Remaining forms: ${forms.length - 1}`)
    }
  }

  const updateForm = (id: string, field: keyof UrlFormData, value: string) => {
    setForms(forms.map((form) => (form.id === id ? { ...form, [field]: value, error: undefined } : form)))
  }

  const validateForm = (form: UrlFormData): string | null => {
    const urlValidation = validateUrl(form.originalUrl)
    if (!urlValidation.isValid) {
      return urlValidation.error!
    }

    const shortCodeValidation = validateShortCode(form.customCode)
    if (!shortCodeValidation.isValid) {
      return shortCodeValidation.error!
    }

    const validityValidation = validateValidity(form.validity)
    if (!validityValidation.isValid) {
      return validityValidation.error!
    }

    // Check shortcode uniqueness
    if (form.customCode && !urlStorage.isShortCodeUnique(form.customCode)) {
      return "This shortcode is already taken"
    }

    return null
  }

  const handleSubmit = async () => {
    Log("frontend", "info", "component", "Starting URL shortening process")
    setIsSubmitting(true)
    setGlobalError("")

    try {
      // Validate all forms
      const validatedForms = forms.map((form) => ({
        ...form,
        error: validateForm(form),
      }))

      const hasErrors = validatedForms.some((form) => form.error)
      if (hasErrors) {
        setForms(validatedForms)
        Log("frontend", "warn", "component", "Form validation failed")
        setIsSubmitting(false)
        return
      }

      // Create shortened URLs
      const createdUrls: ShortUrl[] = []

      for (const form of validatedForms) {
        const shortCode = form.customCode || urlStorage.generateUniqueShortCode()
        const validityMinutes = Number.parseInt(form.validity) || 30
        const now = new Date()
        const expiresAt = new Date(now.getTime() + validityMinutes * 60 * 1000)

        const shortUrl: ShortUrl = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          originalUrl: form.originalUrl,
          shortCode,
          customCode: form.customCode || undefined,
          createdAt: now,
          expiresAt,
          validityMinutes,
          clickCount: 0,
          clicks: [],
        }

        urlStorage.saveUrl(shortUrl)
        createdUrls.push(shortUrl)

        Log("frontend", "info", "component", `Created short URL: ${shortCode} -> ${form.originalUrl}`)
      }

      onUrlsCreated(createdUrls)

      // Reset forms
      setForms([{ id: "1", originalUrl: "", customCode: "", validity: "" }])

      Log("frontend", "info", "component", `Successfully created ${createdUrls.length} short URLs`)
    } catch (error) {
      Log("frontend", "error", "component", `Error creating short URLs: ${error}`)
      setGlobalError("An error occurred while creating short URLs. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LinkIcon />
          URL Shortener
        </Typography>

        {globalError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {globalError}
          </Alert>
        )}

        {forms.map((form, index) => (
          <Card key={form.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">URL {index + 1}</Typography>
              {forms.length > 1 && (
                <IconButton onClick={() => removeForm(form.id)} color="error">
                  <Delete />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Original URL"
                  placeholder="https://example.com"
                  value={form.originalUrl}
                  onChange={(e) => updateForm(form.id, "originalUrl", e.target.value)}
                  error={!!form.error && form.error.includes("URL")}
                  helperText={form.error && form.error.includes("URL") ? form.error : ""}
                  InputProps={{
                    startAdornment: <LinkIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Custom Shortcode (Optional)"
                  placeholder="my-link"
                  value={form.customCode}
                  onChange={(e) => updateForm(form.id, "customCode", e.target.value)}
                  error={!!form.error && form.error.includes("shortcode")}
                  helperText={
                    form.error && form.error.includes("shortcode") ? form.error : "Leave empty for auto-generation"
                  }
                  InputProps={{
                    startAdornment: <Code sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Validity (Minutes)"
                  placeholder="30"
                  type="number"
                  value={form.validity}
                  onChange={(e) => updateForm(form.id, "validity", e.target.value)}
                  error={!!form.error && form.error.includes("Validity")}
                  helperText={form.error && form.error.includes("Validity") ? form.error : "Default: 30 minutes"}
                  InputProps={{
                    startAdornment: <Schedule sx={{ mr: 1, color: "text.secondary" }} />,
                  }}
                />
              </Grid>
            </Grid>
          </Card>
        ))}

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {forms.length < 5 && (
            <Button variant="outlined" startIcon={<Add />} onClick={addForm}>
              Add Another URL ({forms.length}/5)
            </Button>
          )}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || forms.every((f) => !f.originalUrl.trim())}
            sx={{ ml: "auto" }}
          >
            {isSubmitting ? "Creating..." : "Shorten URLs"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default UrlForm
