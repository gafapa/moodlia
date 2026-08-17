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
  title: "MoodlIA — Three ways to make Moodle work better",
  description:
    "MoodlIA brings AI, practical teaching tools, and clear learning insights to Moodle. Explore three open project areas and get direct help when you need it.",
  keywords: [
    "Moodle AI",
    "AI tools for Moodle",
    "Moodle teaching tools",
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
    title: "MoodlIA — Three ways to make Moodle work better",
    description:
      "Connect with AI, teach with confidence, and see what matters—with direct help whenever you need it.",
    url: "https://moodlia.com",
    siteName: "MoodlIA",
    locale: "en_US",
    images: [{ url: "/og-three.png", width: 1536, height: 1024, alt: "Three ways MoodlIA makes Moodle work better" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodlIA — Three ways to make Moodle work better",
    description:
      "Connect with AI, teach with confidence, and see what matters—with direct help whenever you need it.",
    images: ["/og-three.png"],
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
