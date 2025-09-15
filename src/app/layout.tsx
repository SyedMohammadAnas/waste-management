import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
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
  title: "Waste Management System - WasteTracker",
  description: "Real-time waste management and reporting application with map visualization and geolocation tracking",
  keywords: "waste management, environmental tracking, recycling, map visualization, geolocation",
  authors: [{ name: "Waste Management Team" }],
  creator: "Waste Management System",
  publisher: "WasteTracker",
  robots: "index, follow",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: "#059669",
  colorScheme: "light dark",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WasteTracker",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#059669",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Configuration */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />

        {/* iOS Safari PWA Configuration */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WasteTracker" />

        {/* Android Chrome PWA Configuration */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#059669" />

        {/* Prevent zoom and enable touch gestures */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />

        {/* Disable automatic phone number detection */}
        <meta name="format-detection" content="telephone=no" />

        {/* Microsoft Windows PWA Configuration */}
        <meta name="msapplication-TileColor" content="#059669" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased touch-manipulation overscroll-none`}
      >
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
