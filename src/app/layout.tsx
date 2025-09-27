import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaS Dashboard - Product Hunt, Hacker News & GitHub Analytics",
  description: "Free public dashboard for tracking Product Hunt trends, Hacker News posts, and GitHub repositories with advanced insights and analytics.",
  keywords: ["SaaS", "Product Hunt", "Hacker News", "GitHub", "Analytics", "Dashboard", "Trends", "Startups"],
  authors: [{ name: "SaaS Dashboard Team" }],
  robots: "index, follow",
  openGraph: {
    title: "SaaS Dashboard - Advanced Analytics Platform",
    description: "Track trends across Product Hunt, Hacker News, and GitHub with real-time analytics and insights.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Dashboard - Advanced Analytics Platform",
    description: "Track trends across Product Hunt, Hacker News, and GitHub with real-time analytics and insights.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
