import type { LogLevel } from "@/frontend test submission/types"

const LOGGING_API_ENDPOINT = "http://20.244.56.144/evaluation-service/logs"

/**
 * Custom logging middleware. Sends log data to a remote API endpoint.
 * No console.log is used as per requirements.
 * @param stack - The component or function where the log originated (e.g., 'URLShortenerPage', 'handleShorten').
 * @param level - The log level ('INFO', 'WARN', 'ERROR').
 * @param pkg - The package name (e.g., 'frontend-app').
 * @param message - The log message.
 */
export async function Log(stack: string, level: LogLevel, pkg: string, message: string): Promise<void> {
  try {
    const logData = {
      timestamp: new Date().toISOString(),
      stack,
      level,
      package: pkg,
      message,
    }

    // Using fetch to send log data to the API endpoint
    const response = await fetch(LOGGING_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(logData),
    })

    // We don't use console.log, so just handle the response silently
    if (!response.ok) {
      // In a real application, this might be sent to a different, more robust error logging system
      // For this exercise, we simply acknowledge the failure without logging to console.
      // No console.error here.
    }
  } catch (error) {
    // Catch network errors or other issues during the fetch request
    // Again, no console.log.
  }
}
