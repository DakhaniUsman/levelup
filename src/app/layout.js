import { Space_Grotesk, Inter } from "next/font/google";
import ThemeProvider from "@/components/providers/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import LenisProvider from "@/components/providers/LenisProvider";
import { AppThemeProvider } from "@/contexts/AppThemeContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "LevelUp — Your Personal Growth System",
    template: "%s | LevelUp",
  },
  description:
    "A premium productivity system to help you level up every day. Track tasks, build streaks, and grow intentionally.",
  keywords: ["productivity", "todo", "personal growth", "task manager", "levelup"],
  authors: [{ name: "LevelUp" }],
  openGraph: {
    title: "LevelUp — Your Personal Growth System",
    description: "Track tasks, build streaks, and grow intentionally.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "LevelUp — Your Personal Growth System",
    description: "Track tasks, build streaks, and grow intentionally.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#081c29" },
    { media: "(prefers-color-scheme: light)", color: "#f0f8ff" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <AppThemeProvider>
            <QueryProvider>
              <LenisProvider>{children}</LenisProvider>
            </QueryProvider>
          </AppThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
