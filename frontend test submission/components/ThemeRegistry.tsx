"use client"

import * as React from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

const getDesignTokens = (mode: "light" | "dark") => ({
  palette: {
    mode,
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: mode === "light" ? "#f7f9fb" : "#181a1b",
      paper: mode === "light" ? "#fff" : "#23272a",
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
})

const ColorModeContext = React.createContext({ toggleColorMode: () => {}, mode: "light" as "light" | "dark" })

export function useColorMode() {
  return React.useContext(ColorModeContext)
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  // Always start with 'light' to match SSR, then update on client
  const [mode, setMode] = React.useState<"light" | "dark">("light")

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setMode(prefersDark ? "dark" : "light")
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => setMode(e.matches ? "dark" : "light")
      mq.addEventListener("change", handleChange)
      return () => mq.removeEventListener("change", handleChange)
    }
  }, [])

  const colorMode = React.useMemo(
    () => ({
      mode,
      toggleColorMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [mode]
  )

  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
} 