# URL Shortener Application

This is a React-based URL shortener web application built with Next.js (App Router) and Material UI. It provides core URL shortening functionality, displays analytical insights, and handles client-side redirection.

## Folder Structure

The project follows a specific top-level folder structure:

```
├── Logging Middleware/
│   └── logger.ts
└── Frontend Test Submission/
    ├── app/
    │   ├── [shortcode]/
    │   │   └── page.tsx
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── stats/
    │       └── page.tsx
    ├── lib/
    │   ├── storage.ts
    │   └── utils.ts
    └── types/
        └── index.ts
```
*   **`/Logging Middleware`**: Contains the custom logging utility (`logger.ts`) responsible for sending application logs to a remote endpoint.
*   **`/Frontend Test Submission`**: Contains all the core application code, including Next.js pages, shared libraries, and TypeScript type definitions.

## Technology Choices

*   **React (TypeScript)**: Chosen for building a dynamic and interactive user interface. TypeScript enhances code quality, maintainability, and developer experience by providing static type checking.
*   **Next.js (App Router)**: Utilized for its powerful features like file-system based routing, server components (though client components are used where `localStorage` or client-side interactions are needed), and optimized build processes. The App Router simplifies routing and data fetching patterns.
*   **Material UI**: Selected as the primary styling framework. Material UI provides a comprehensive set of pre-built, customizable React components that adhere to Material Design guidelines, ensuring a consistent, responsive, and visually appealing user interface without relying on traditional CSS frameworks like Tailwind CSS or Bootstrap.

## Routing Strategy

The application leverages Next.js App Router's file-system based routing:

*   **`/` (Root Route)**: Corresponds to `Frontend Test Submission/app/page.tsx`. This is the main URL Shortener page where users can input and shorten URLs.
*   **`/stats`**: Corresponds to `Frontend Test Submission/app/stats/page.tsx`. This page displays a list of all shortened URLs and their associated statistics.
*   **`/[shortcode]` (Dynamic Route)**: Corresponds to `Frontend Test Submission/app/[shortcode]/page.tsx`. This dynamic route is crucial for handling redirection. When a user accesses a shortened URL (e.g., `yourdomain.com/abcd1`), this route captures the `abcd1` shortcode and initiates a client-side redirect to the original long URL.

## URL Shortening and Redirection Logic

### URL Shortening

1.  **Client-Side Validation**: Before any processing, user inputs (long URL, validity, custom shortcode) are validated on the client-side to ensure correct format (valid URL, positive integer for validity, alphanumeric for shortcode).
2.  **Shortcode Generation/Uniqueness**:
    *   If a custom shortcode is provided, the application checks if it's already in use. If so, a user-friendly error message is displayed.
    *   If no custom shortcode is provided, a unique alphanumeric shortcode is programmatically generated. The generation process ensures the shortcode does not conflict with any existing ones.
3.  **Expiry Calculation**: If no validity period is specified, the shortened URL defaults to a 30-minute expiry. Otherwise, the provided minutes are used to calculate the expiry timestamp.
4.  **Local Storage Persistence**: The shortened URL data (original URL, shortcode, expiry time, creation time, and click data) is stored in the browser's `localStorage` for client-side persistence across sessions.

### Redirection

1.  **Dynamic Route Handling**: When a user navigates to a shortened URL (e.g., `/abcd1`), the `Frontend Test Submission/app/[shortcode]/page.tsx` component is rendered.
2.  **Shortcode Extraction**: The `shortcode` is extracted from the URL parameters.
3.  **URL Lookup**: The application looks up the corresponding original URL in `localStorage` using the extracted shortcode.
4.  **Expiry Check**: It verifies if the found URL has expired.
5.  **Click Tracking**: If the URL is active, a click event (timestamp, referrer, approximate location placeholder) is recorded and added to the URL's click data in `localStorage`.
6.  **Client-Side Redirect**: Finally, `window.location.replace()` is used to perform a client-side redirect to the original long URL. If the shortcode is not found or expired, an error message is displayed, and the user is redirected back to the home page.

## Logging Integration

The application strictly adheres to a custom logging middleware. All logging throughout the codebase is performed using the `Log(stack, level, package, message)` function from `Logging Middleware/logger.ts`. This ensures:

*   **Centralized Logging**: All application events and errors are routed through a single, controlled function.
*   **No `console.log`**: Direct `console.log` or other inbuilt logging functions are explicitly avoided, as per requirements.
*   **Remote Reporting**: Log data is sent via a POST request to `http://20.244.56.144/evaluation-service/logs`, allowing for external monitoring and analysis.

Example usage:
\`\`\`typescript
import { Log } from "@/Logging Middleware/logger";

// ... inside a component or function
Log("URLShortenerPage", "INFO", "frontend-app", "Short URL successfully created.");
\`\`\`

## Validations & Defaults

All specified validations and default values are handled on the client-side:

*   **Long URL Format**: Validated using `new URL()` to ensure it's a legitimate URL.
*   **Validity Period**: If provided, it's checked to be a positive integer. If not provided, it defaults to **30 minutes**.
*   **Custom Shortcode**: If entered, it's validated to be alphanumeric.
*   **Shortcode Uniqueness**: Both auto-generated and custom shortcodes are checked against existing ones in `localStorage` to guarantee uniqueness. A user-friendly error message is displayed if a custom shortcode is already taken.

## Mobile and Desktop Layouts

The application is designed to be responsive across various screen sizes. Material UI's `Container`, `Grid`, `Box`, and `Paper` components are extensively used to manage layout and ensure proper rendering on both mobile and desktop devices. Components like `TextField` and `Button` are set to `fullWidth` where appropriate to adapt to available space.
