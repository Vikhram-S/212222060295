"use client"

import type React from "react"
import { Card, CardContent, Typography, Box, Chip, IconButton, Tooltip, Alert, Grid } from "@mui/material"
import { ContentCopy, Launch, Schedule, Link as LinkIcon } from "@mui/icons-material"
import type { ShortUrl } from "../lib/url-storage"
import { Log } from "../lib/logging-middleware"

interface Props {
  urls: ShortUrl[]
}

const UrlResults: React.FC<Props> = ({ urls }) => {
  const copyToClipboard = async (text: string, shortCode: string) => {
    try {
      await navigator.clipboard.writeText(text)
      Log("frontend", "info", "component", `Copied short URL to clipboard: ${shortCode}`)
    } catch (error) {
      Log("frontend", "error", "component", `Failed to copy to clipboard: ${error}`)
    }
  }

  const openUrl = (url: string, shortCode: string) => {
    window.open(url, "_blank")
    Log("frontend", "info", "component", `Opened original URL: ${shortCode}`)
  }

  const formatExpiryTime = (expiresAt: Date): string => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  const getShortUrl = (shortCode: string): string => {
    return `${window.location.origin}/${shortCode}`
  }

  if (urls.length === 0) {
    return null
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LinkIcon />
          Your Shortened URLs
        </Typography>

        <Alert severity="success" sx={{ mb: 2 }}>
          Successfully created {urls.length} short URL{urls.length > 1 ? "s" : ""}!
        </Alert>

        {urls.map((url) => {
          const shortUrl = getShortUrl(url.shortCode)
          const isExpired = new Date() > url.expiresAt

          return (
            <Card key={url.id} variant="outlined" sx={{ mb: 2, opacity: isExpired ? 0.6 : 1 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Original URL
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: "break-all",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {url.originalUrl}
                        <Tooltip title="Open original URL">
                          <IconButton size="small" onClick={() => openUrl(url.originalUrl, url.shortCode)}>
                            <Launch fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Short URL
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
                        >
                          {shortUrl}
                        </Typography>
                        <Tooltip title="Copy to clipboard">
                          <IconButton size="small" onClick={() => copyToClipboard(shortUrl, url.shortCode)}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                  <Chip
                    icon={<Schedule />}
                    label={`Expires in: ${formatExpiryTime(url.expiresAt)}`}
                    color={isExpired ? "error" : "default"}
                    size="small"
                  />

                  {url.customCode && <Chip label="Custom Code" color="primary" size="small" />}

                  <Chip label={`${url.validityMinutes} min validity`} variant="outlined" size="small" />

                  <Chip label={`Created: ${url.createdAt.toLocaleString()}`} variant="outlined" size="small" />
                </Box>
              </CardContent>
            </Card>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default UrlResults
