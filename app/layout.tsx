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
  title: "MoodlIA — Open tools for Moodle",
  description:
    "Open tools for building, automating, grading, and understanding Moodle courses.",
  openGraph: {
    title: "MoodlIA — Open tools for Moodle",
    description:
      "Open tools for building, automating, grading, and understanding Moodle courses.",
    url: "https://moodlia.com",
    siteName: "MoodlIA",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "MoodlIA — Open tools for Moodle" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodlIA — Open tools for Moodle",
    description:
      "Open tools for building, automating, grading, and understanding Moodle courses.",
    images: ["/og.png"],
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
