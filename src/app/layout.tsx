import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_Myanmar } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Shield } from "@/components/shield";
import { StorageGuardian } from "@/components/storage-guardian";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Self-hosted at build time (next/font downloads + inlines it) so Burmese
// input renders consistently without a runtime request to Google Fonts —
// the CSP has no font-src/style-src allowance for that origin on purpose.
const notoSansMyanmar = Noto_Sans_Myanmar({
  variable: "--font-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d9488",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "DietTracker - All Derma Medical Clinic",
  description:
    "Medical diet tracking application for All Derma Medical Clinic",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DietTracker",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${notoSansMyanmar.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <Shield />
        <StorageGuardian />
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
