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
  metadataBase: new URL("https://moodlia.com"),
  title: "MoodlIA — Open-source AI tools for Moodle",
  description:
    "Open-source AI tools for Moodle: MCP and CLI integration, browser tools for rubrics and grading, plus dashboards and learning analytics.",
  keywords: [
    "Moodle AI",
    "Moodle MCP",
    "Moodle CLI",
    "Moodle grading",
    "Moodle rubrics",
    "Moodle analytics",
    "open-source Moodle tools",
  ],
  alternates: { canonical: "/" },
  category: "education technology",
  creator: "MoodlIA",
  publisher: "MoodlIA",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "MoodlIA — Open-source AI tools for Moodle",
    description:
      "Connect Moodle to AI, support daily teaching, and turn learning activity into clear insight.",
    url: "https://moodlia.com",
    siteName: "MoodlIA",
    locale: "en_US",
    images: [{ url: "/og-ecosystem.png", width: 1536, height: 1024, alt: "MoodlIA AI tools for Moodle" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodlIA — Open-source AI tools for Moodle",
    description:
      "Connect Moodle to AI, support daily teaching, and turn learning activity into clear insight.",
    images: ["/og-ecosystem.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
