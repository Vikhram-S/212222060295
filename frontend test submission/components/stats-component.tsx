"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  Grid,
  IconButton,
  Tooltip,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { Analytics, Launch, ContentCopy, Refresh, Visibility } from "@mui/icons-material"
import UrlStorage, { type ShortUrl } from "../lib/url-storage"
import { Log } from "../lib/logging-middleware"

interface Props {
  refreshTrigger?: number
}

const StatsComponent: React.FC<Props> = ({ refreshTrigger = 0 }) => {
  const [urls, setUrls] = useState<ShortUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    loadStats()
  }, [refreshTrigger])

  const loadStats = () => {
    try {
      setLoading(true)
      setError("")

      Log("frontend", "info", "component", "Loading URL statistics")

      // Check if we're in browser environment
      if (typeof window === "undefined") {
        setError("Not in browser environment")
        return
      }

      const urlStorage = UrlStorage.getInstance()
      const allUrls = urlStorage.getAllUrls()

      console.log("Loaded URLs:", allUrls) // Debug log

      setUrls(allUrls)
      Log("frontend", "info", "component", `Loaded ${allUrls.length} URLs for statistics`)
    } catch (err) {
      const errorMsg = `Error loading statistics: ${err}`
      setError(errorMsg)
      Log("frontend", "error", "component", errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert("Copied to clipboard!")
    } catch (error) {
      console.error("Copy failed:", error)
    }
  }

  const getShortUrl = (shortCode: string): string => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${shortCode}`
    }
    return `http://localhost:3000/${shortCode}`
  }

  const isExpired = (url: ShortUrl): boolean => {
    return new Date() > new Date(url.expiresAt)
  }

  const getTotalClicks = (): number => {
    return urls.reduce((total, url) => total + (url.clickCount || 0), 0)
  }

  const getActiveUrls = (): number => {
    return urls.filter((url) => !isExpired(url)).length
  }

  // Add some test data if no URLs exist (for testing)
  const addTestData = () => {
    const urlStorage = UrlStorage.getInstance()
    const testUrl: ShortUrl = {
      id: Date.now().toString(),
      originalUrl: "https://example.com",
      shortCode: "test123",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      validityMinutes: 30,
      clickCount: 5,
      clicks: [
        {
          timestamp: new Date(),
          referrer: "Direct",
          location: "Unknown",
          userAgent: "Test Browser",
        },
      ],
    }

    urlStorage.saveUrl(testUrl)
    loadStats()
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>Loading statistics...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        <Typography variant="h6">Error Loading Statistics</Typography>
        <Typography variant="body2">{error}</Typography>
        <Button onClick={loadStats} sx={{ mt: 1 }}>
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Analytics />
          URL Statistics
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadStats}>
            Refresh
          </Button>
          {urls.length === 0 && (
            <Button variant="contained" onClick={addTestData}>
              Add Test Data
            </Button>
          )}
        </Box>
      </Box>

      {urls.length === 0 ? (
        <Alert severity="info" sx={{ textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No URLs Created Yet
          </Typography>
          <Typography variant="body2">
            Go to the Shortener tab to create your first short URL, or click "Add Test Data" to see how statistics work!
          </Typography>
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="primary">
                    {urls.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total URLs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="success.main">
                    {getActiveUrls()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active URLs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="error.main">
                    {urls.length - getActiveUrls()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expired URLs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="info.main">
                    {getTotalClicks()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Clicks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* URL Table */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                All URLs
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Short URL</TableCell>
                      <TableCell>Original URL</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Clicks</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {urls.map((url) => {
                      const shortUrl = getShortUrl(url.shortCode)
                      const expired = isExpired(url)

                      return (
                        <TableRow key={url.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", color: "primary.main" }}>
                              {shortUrl}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {url.originalUrl}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={expired ? "Expired" : "Active"}
                              color={expired ? "error" : "success"}
                              size="small"
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              icon={<Visibility />}
                              label={url.clickCount || 0}
                              size="small"
                              color={url.clickCount > 0 ? "primary" : "default"}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">{new Date(url.createdAt).toLocaleDateString()}</Typography>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title="Copy short URL">
                                <IconButton size="small" onClick={() => copyToClipboard(shortUrl)}>
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Open original URL">
                                <IconButton size="small" onClick={() => window.open(url.originalUrl, "_blank")}>
                                  <Launch fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}

export default StatsComponent
