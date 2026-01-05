import type { Metadata } from "next";
import Script from "next/script";

import { ToastProvider } from "@/components/ui/Toast";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

import "./globals.css";

export const metadata: Metadata = {
  title: "dotz - Minimalist Journaling App",
  description:
    "A minimalist journaling app for the focused mind. One dot, one day. Track your year with 365 days of journaling.",
  keywords: [
    "journal",
    "journaling",
    "diary",
    "minimalist",
    "365 days",
    "year tracker",
  ],
  authors: [{ name: "sammarxz", url: "https://marxz.me" }],
  creator: "sammarxz",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dotz.marxz.me",
    title: "dotz - Minimalist Journaling App",
    description:
      "A minimalist journaling app for the focused mind. One dot, one day.",
    siteName: "dotz",
  },
  twitter: {
    card: "summary_large_image",
    title: "dotz - Minimalist Journaling App",
    description:
      "A minimalist journaling app for the focused mind. One dot, one day.",
    creator: "@sammarxz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="f8454e6d-4c49-41f6-ad7b-f5a2da08196e"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <ServiceWorkerRegistration />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
