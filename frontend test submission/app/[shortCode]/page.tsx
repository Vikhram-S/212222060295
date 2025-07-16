"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Box, Typography, CircularProgress, Alert, Button } from "@mui/material"
import { Home, Launch } from "@mui/icons-material"
import UrlStorage from "../../lib/url-storage"
import { Log } from "../../lib/logging-middleware"

export default function RedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "redirecting" | "not-found" | "expired">("loading")
  const [originalUrl, setOriginalUrl] = useState<string>("")

  const shortCode = params.shortCode as string
  const urlStorage = UrlStorage.getInstance()

  useEffect(() => {
    if (!shortCode) {
      setStatus("not-found")
      return
    }

    handleRedirect()
  }, [shortCode])

  const handleRedirect = async () => {
    try {
      Log("frontend", "info", "page", `Attempting to redirect shortcode: ${shortCode}`)

      const url = urlStorage.findByShortCode(shortCode)

      if (!url) {
        Log("frontend", "warn", "page", `Shortcode not found: ${shortCode}`)
        setStatus("not-found")
        return
      }

      if (urlStorage.isUrlExpired(url)) {
        Log("frontend", "warn", "page", `Expired URL accessed: ${shortCode}`)
        setStatus("expired")
        setOriginalUrl(url.originalUrl)
        return
      }

      // Record the click
      const referrer = document.referrer || "Direct"
      urlStorage.recordClick(shortCode, referrer)

      setOriginalUrl(url.originalUrl)
      setStatus("redirecting")

      Log("frontend", "info", "page", `Redirecting ${shortCode} to ${url.originalUrl}`)

      // Small delay to show the redirecting message
      setTimeout(() => {
        window.location.href = url.originalUrl
      }, 1500)
    } catch (error) {
      Log("frontend", "error", "page", `Error during redirect: ${error}`)
      setStatus("not-found")
    }
  }

  const goHome = () => {
    router.push("/")
  }

  const openOriginalUrl = () => {
    if (originalUrl) {
      window.open(originalUrl, "_blank")
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        p: 3,
      }}
    >
      {status === "loading" && (
        <>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Looking up short URL...</Typography>
        </>
      )}

      {status === "redirecting" && (
        <>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Redirecting you to:
          </Typography>
          <Typography variant="body1" color="primary" sx={{ wordBreak: "break-all", mb: 2 }}>
            {originalUrl}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If you are not redirected automatically, click the button below.
          </Typography>
          <Button variant="contained" startIcon={<Launch />} onClick={openOriginalUrl} sx={{ mt: 2 }}>
            Go to URL
          </Button>
        </>
      )}

      {status === "not-found" && (
        <>
          <Alert severity="error" sx={{ mb: 3, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              Short URL Not Found
            </Typography>
            <Typography variant="body2">
              The short URL "/{shortCode}" does not exist or may have been removed.
            </Typography>
          </Alert>

          <Button variant="contained" startIcon={<Home />} onClick={goHome}>
            Go to Homepage
          </Button>
        </>
      )}

      {status === "expired" && (
        <>
          <Alert severity="warning" sx={{ mb: 3, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>
              Short URL Expired
            </Typography>
            <Typography variant="body2" gutterBottom>
              This short URL has expired and is no longer valid.
            </Typography>
            {originalUrl && (
              <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                Original URL: {originalUrl}
              </Typography>
            )}
          </Alert>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
            {originalUrl && (
              <Button variant="outlined" startIcon={<Launch />} onClick={openOriginalUrl}>
                Visit Original URL
              </Button>
            )}

            <Button variant="contained" startIcon={<Home />} onClick={goHome}>
              Go to Homepage
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}
