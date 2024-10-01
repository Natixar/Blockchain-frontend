import type { Metadata, Viewport } from "next";
import { Questrial } from "next/font/google";
import "./globals.css";

const questrial = Questrial({weight: '400', subsets: ['latin']});

const APP_NAME = "Natixar";
const APP_DEFAULT_TITLE = "Natixar CO2 Tracking";
const APP_TITLE_TEMPLATE = "%s - PWA App";
const APP_DESCRIPTION = "Natixar webapp that offer CO2 tracking";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head />
      <body className={questrial.className}>{children}</body>
    </html>
  );
}
