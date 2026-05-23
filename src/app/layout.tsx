import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import ProgressBarProvider from "@/components/ProgressBarProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Verence - The Essence of Truth",
  description:
    "Verence publishes analysis, essays, and insights that challenge assumptions, illuminate reality, and reward deep thinking. For readers who refuse shallow takes, we provide clarity, context, and perspective.",
  metadataBase: new URL("https://verence-placeholder.com"),
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Verence - The Essence of Truth",
    description:
      "Verence publishes analysis, essays, and insights that challenge assumptions, illuminate reality, and reward deep thinking. For readers who refuse shallow takes, we provide clarity, context, and perspective.",
    url: "https://verence-placeholder.com",
    siteName: "Verence",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://placehold.co/1200x630/00120b/e6f6f0?text=Verence",
        width: 1200,
        height: 630,
        alt: "Verence - The Essence of Truth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verence - The Essence of Truth",
    description:
      "Verence publishes analysis, essays, and insights that challenge assumptions, illuminate reality, and reward deep thinking. For readers who refuse shallow takes, we provide clarity, context, and perspective.",
    images: ["https://placehold.co/1200x630/00120b/e6f6f0?text=Verence"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.variable}>
        <ProgressBarProvider>{children}</ProgressBarProvider>
      </body>
    </html>
  );
}
