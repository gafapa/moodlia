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
  title: "MoodlIA — Three ways to improve Moodle",
  description:
    "Connect Moodle to AI, make daily teaching lighter, and turn learning activity into clear insight.",
  openGraph: {
    title: "MoodlIA — Three ways to improve Moodle",
    description:
      "Connect Moodle to AI, make daily teaching lighter, and turn learning activity into clear insight.",
    url: "https://moodlia.com",
    siteName: "MoodlIA",
    images: [{ url: "/og-ecosystem.png", width: 1536, height: 1024, alt: "MoodlIA — Three ways to improve Moodle" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodlIA — Three ways to improve Moodle",
    description:
      "Connect Moodle to AI, make daily teaching lighter, and turn learning activity into clear insight.",
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
