import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brutti-ai-marketing-hub.michelle-clairea22.chatgpt.site"),
  title: "BRUTTI AI Marketing Hub",
  description: "Plan, create and manage BRUTTI marketing from any device.",
  manifest: "/manifest.webmanifest",
  applicationName: "BRUTTI AI",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: "BRUTTI AI",
    statusBarStyle: "default",
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: "https://brutti-ai-marketing-hub.michelle-clairea22.chatgpt.site",
    siteName: "BRUTTI AI",
    title: "BRUTTI AI Marketing Hub",
    description: "Plan, create and manage marketing from any device.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BRUTTI AI Marketing Hub on mobile and tablet" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BRUTTI AI Marketing Hub",
    description: "Plan, create and manage marketing from any device.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1f3128",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-MY">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
