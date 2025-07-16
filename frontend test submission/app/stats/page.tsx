"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Grid,
  IconButton,
  Tooltip,
  Container,
  Divider,
  Button,
} from "@mui/material"
import {
  ExpandMore,
  Analytics,
  Launch,
  Schedule,
  Visibility,
  LocationOn,
  Link as LinkIcon,
  ContentCopy,
} from "@mui/icons-material"
import UrlStorage, { type ShortUrl } from "../../lib/url-storage"
import { Log } from "../../lib/logging-middleware"
import { useTheme } from "@mui/material/styles"
import { useColorMode } from "../../components/ThemeRegistry"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import Link from "next/link"

const StatsPage: React.FC = () => {
  const [urls, setUrls] = useState<ShortUrl[]>([])
  const [loading, setLoading] = useState(true)

  const urlStorage = UrlStorage.getInstance()
  const { mode, toggleColorMode } = useColorMode()
  const theme = useTheme()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    try {
      Log("frontend", "info", "page", "Loading URL statistics")
      const allUrls = urlStorage.getAllUrls()
      setUrls(allUrls)
      Log("frontend", "info", "page", `Loaded ${allUrls.length} URLs for statistics`)
    } catch (error) {
      Log("frontend", "error", "page", `Error loading statistics: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, shortCode: string) => {
    try {
      await navigator.clipboard.writeText(text)
      Log("frontend", "info", "page", `Copied short URL to clipboard: ${shortCode}`)
    } catch (error) {
      Log("frontend", "error", "page", `Failed to copy to clipboard: ${error}`)
    }
  }

  const openUrl = (url: string, shortCode: string) => {
    window.open(url, "_blank")
    Log("frontend", "info", "page", `Opened original URL from stats: ${shortCode}`)
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString()
  }

  const getShortUrl = (shortCode: string): string => {
    return `${window.location.origin}/${shortCode}`
  }

  const isExpired = (url: ShortUrl): boolean => {
    return new Date() > new Date(url.expiresAt)
  }

  const getTotalClicks = (): number => {
    return urls.reduce((total, url) => total + url.clickCount, 0)
  }

  const getActiveUrls = (): number => {
    return urls.filter((url) => !isExpired(url)).length
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>Loading statistics...</Typography>
      </Box>
    )
  }

  if (urls.length === 0) {
    return <Alert severity="info">No URLs have been shortened yet. Go to the Shortener tab to create some!</Alert>
  }

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', py: { xs: 1, sm: 4 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 0.5, sm: 2, md: 0 } }}>
        <Box sx={{ mb: { xs: 1, sm: 4 }, textAlign: "center", position: "relative" }}>
          <Box sx={{ position: "absolute", top: 0, right: 0 }}>
            <Button
              variant="outlined"
              color={mode === "dark" ? "primary" : "inherit"}
              onClick={toggleColorMode}
              startIcon={mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              sx={{ mt: 1, mr: 1 }}
            >
              {mode === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
          </Box>
          <Box sx={{ position: "absolute", top: 0, left: 0 }}>
            <Link href="/" passHref legacyBehavior>
              <Button variant="outlined" color="inherit" startIcon={<ArrowBackIcon />} sx={{ mt: 1, ml: 1 }}>
                Back
              </Button>
            </Link>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, letterSpacing: 1, color: theme.palette.text.primary, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Analytics fontSize="large" color="primary" />
            URL Statistics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your shortened links and their performance
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: { xs: 1, sm: 5 } }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={4} sx={{ borderRadius: 3, bgcolor: 'background.paper', minWidth: 0 }}>
              <CardContent sx={{ textAlign: "center", p: { xs: 1.5, sm: 3 } }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700, fontSize: { xs: 22, sm: 32 } }}>{urls.length}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 16 } }}>Total URLs</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={4} sx={{ borderRadius: 3, bgcolor: 'background.paper', minWidth: 0 }}>
              <CardContent sx={{ textAlign: "center", p: { xs: 1.5, sm: 3 } }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700, fontSize: { xs: 22, sm: 32 } }}>{getActiveUrls()}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 16 } }}>Active URLs</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={4} sx={{ borderRadius: 3, bgcolor: 'background.paper', minWidth: 0 }}>
              <CardContent sx={{ textAlign: "center", p: { xs: 1.5, sm: 3 } }}>
                <Typography variant="h4" color="info.main" sx={{ fontWeight: 700, fontSize: { xs: 22, sm: 32 } }}>{getTotalClicks()}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 16 } }}>Total Clicks</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ mb: { xs: 1, sm: 4 } }} />

        {/* URL Details */}
        {urls.map((url) => {
          const shortUrl = getShortUrl(url.shortCode)
          const expired = isExpired(url)

          return (
            <Accordion key={url.id} sx={{ mb: { xs: 1, sm: 3 }, borderRadius: 2, boxShadow: 2, bgcolor: 'background.paper', color: 'text.primary', minWidth: 0 }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: { xs: 48, sm: 56 } }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: 2, width: "100%" }}>
                  <LinkIcon color={expired ? "disabled" : "primary"} sx={{ mb: { xs: 1, sm: 0 }, fontSize: { xs: 20, sm: 28 } }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: "monospace", fontWeight: 600, color: 'text.primary', fontSize: { xs: 13, sm: 16 } }}>
                      {shortUrl}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all", fontSize: { xs: 11, sm: 14 } }}>
                      → {url.originalUrl}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <Chip
                      icon={<Visibility />}
                      label={`${url.clickCount} clicks`}
                      size="small"
                      color={url.clickCount > 0 ? "primary" : "default"}
                      sx={{ fontSize: { xs: 11, sm: 13 } }}
                    />
                    <Chip label={expired ? "Expired" : "Active"} size="small" color={expired ? "error" : "success"} sx={{ fontSize: { xs: 11, sm: 13 } }} />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 1, sm: 3 } }}>
                <Grid container spacing={2}>
                  {/* URL Info */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ borderRadius: 2, mb: 2, bgcolor: 'background.paper', color: 'text.primary', minWidth: 0 }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: 15, sm: 20 } }}>
                          URL Information
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: 11, sm: 14 } }}>
                            Short URL
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all", color: 'text.primary', fontSize: { xs: 11, sm: 14 } }}>
                              {shortUrl}
                            </Typography>
                            <Tooltip title="Copy to clipboard">
                              <IconButton size="small" onClick={() => copyToClipboard(shortUrl, url.shortCode)}>
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: 11, sm: 14 } }}>
                            Original URL
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" sx={{ wordBreak: "break-all", color: 'text.primary', fontSize: { xs: 11, sm: 14 } }}>
                              {url.originalUrl}
                            </Typography>
                            <Tooltip title="Open original URL">
                              <IconButton size="small" onClick={() => openUrl(url.originalUrl, url.shortCode)}>
                                <Launch fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                          <Chip
                            icon={<Schedule />}
                            label={`Created: ${formatDate(url.createdAt)}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: { xs: 11, sm: 13 } }}
                          />
                          <Chip
                            icon={<Schedule />}
                            label={`Expires: ${formatDate(url.expiresAt)}`}
                            size="small"
                            variant="outlined"
                            color={expired ? "error" : "default"}
                            sx={{ fontSize: { xs: 11, sm: 13 } }}
                          />
                          {url.customCode && <Chip label="Custom Code" size="small" color="primary" sx={{ fontSize: { xs: 11, sm: 13 } }} />}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* Click Analytics */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ borderRadius: 2, mb: 2, bgcolor: 'background.paper', color: 'text.primary', minWidth: 0 }}>
                      <CardContent sx={{ p: { xs: 1.5, sm: 3 } }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: 15, sm: 20 } }}>
                          Click Analytics
                        </Typography>
                        {url.clicks.length === 0 ? (
                          <Alert severity="info">No clicks recorded yet</Alert>
                        ) : (
                          <TableContainer component={Paper} variant="outlined" sx={{ bgcolor: 'background.paper', color: 'text.primary', maxWidth: '100%', overflowX: 'auto' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ color: 'text.primary', fontSize: { xs: 11, sm: 14 } }}>Timestamp</TableCell>
                                  <TableCell sx={{ color: 'text.primary', fontSize: { xs: 11, sm: 14 } }}>Referrer</TableCell>
                                  <TableCell sx={{ color: 'text.primary', fontSize: { xs: 11, sm: 14 } }}>Location</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {url.clicks
                                  .slice(-10)
                                  .reverse()
                                  .map((click, index) => (
                                    <TableRow key={index}>
                                      <TableCell sx={{ color: 'text.primary', fontSize: { xs: 11, sm: 14 } }}>
                                        <Typography variant="body2" sx={{ color: 'text.primary', fontSize: { xs: 11, sm: 14 } }}>{formatDate(click.timestamp)}</Typography>
                                      </TableCell>
                                      <TableCell sx={{ color: 'text.primary', fontSize: { xs: 11, sm: 14 } }}>
                                        <Typography variant="body2" sx={{ color: 'text.primary', fontSize: { xs: 11, sm: 14 } }}>{click.referrer}</Typography>
                                      </TableCell>
                                      <TableCell sx={{ color: 'text.primary', fontSize: { xs: 11, sm: 14 } }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                          <LocationOn fontSize="small" color="action" />
                                          <Typography variant="body2" sx={{ color: 'text.primary', fontSize: { xs: 11, sm: 14 } }}>{click.location}</Typography>
                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                        {url.clicks.length > 10 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", fontSize: { xs: 9, sm: 12 } }}>
                            Showing last 10 clicks out of {url.clicks.length} total
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Container>
    </Box>
  )
}

export default StatsPage
