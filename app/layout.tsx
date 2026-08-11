import type { Metadata } from "next";
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
  title: "BRUTTI AI Marketing Hub",
  description: "Internal marketing workspace for BRUTTI.",
  manifest: "/manifest.webmanifest",
  applicationName: "BRUTTI AI",
  themeColor: "#1f3128",
  appleWebApp: {
    capable: true,
    title: "BRUTTI AI",
    statusBarStyle: "black-translucent",
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/api/icon?v=brutti",
    shortcut: "/api/icon?v=brutti",
    apple: "/api/icon?v=brutti",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
