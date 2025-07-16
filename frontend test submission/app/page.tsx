"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Container, Typography, Box, Tabs, Tab, Button, Divider } from "@mui/material"
import { Link as LinkIcon, Analytics } from "@mui/icons-material"
import Link from "next/link"
import UrlForm from "../components/url-form"
import UrlResults from "../components/url-results"
import type { ShortUrl } from "../lib/url-storage"
import { Log } from "../lib/logging-middleware"
import { useColorMode } from "../components/ThemeRegistry"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import { useTheme } from "@mui/material/styles"

export default function HomePage() {
  const [createdUrls, setCreatedUrls] = useState<ShortUrl[]>([])
  const [tabValue, setTabValue] = useState(0)
  const [refreshStats, setRefreshStats] = useState(0)
  const { mode, toggleColorMode } = useColorMode()
  const theme = useTheme()

  useEffect(() => {
    Log("frontend", "info", "page", "URL Shortener app initialized")
  }, [])

  const handleUrlsCreated = (urls: ShortUrl[]) => {
    setCreatedUrls(urls)
    setRefreshStats((prev) => prev + 1)
    Log("frontend", "info", "page", `Received ${urls.length} newly created URLs`)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4, textAlign: "center", position: "relative" }}>
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
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, letterSpacing: 1, color: theme.palette.text.primary, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <LinkIcon fontSize="large" color="primary" />
            React URL Shortener
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Shorten your links and track their performance
          </Typography>
        </Box>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabs" centered sx={{ mb: 3 }}>
          <Tab icon={<LinkIcon />} label="Shorten URLs" />
        </Tabs>
        <Divider sx={{ mb: 4 }} />
        {tabValue === 0 && (
          <Box>
            <UrlForm onUrlsCreated={handleUrlsCreated} />
            <UrlResults urls={createdUrls} />
          </Box>
        )}
        <Box mt={4} sx={{ textAlign: "center" }}>
          <Link href="/stats" passHref legacyBehavior>
            <Button variant="contained" color="primary" size="large" startIcon={<Analytics />}>View Statistics</Button>
          </Link>
        </Box>
      </Container>
    </Box>
  )
}
