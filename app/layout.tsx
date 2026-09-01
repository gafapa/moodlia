import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const designContract = {
  thesis: "MoodlIA feels like a carefully prepared selection of help for real teaching moments, not a technical platform or a generic SaaS grid.",
  ownWorld: "Warm editorial paper, ballpoint-blue rules, coral and yellow track markers, human education photography, folded sequencing, and concise handwritten-style annotations.",
  story: "Visitors meet one calm promise, scan three connected ways forward, choose the help that fits their moment, or ask a person directly.",
  firstViewport: "A concise education promise sits beside three overlapping educator photographs; a three-track sequence rail turns the ecosystem into an immediate choice.",
  form: "The Helpful Selection, bolder challenger selected by the user; seed 2852ad08.",
  finish: "unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://moodlia.com"),
  title: "MoodlIA — Make Moodle work for you.",
  description:
    "MoodlIA helps educators plan learning, teach with more time, and know where to help next in Moodle. Free, open tools and direct human help.",
  keywords: [
    "Moodle AI",
    "AI tools for Moodle",
    "Moodle teaching tools",
    "Moodle grading",
    "Moodle rubrics",
    "Moodle analytics",
    "Moodle support",
  ],
  alternates: {
    canonical: "/",
    languages: { en: "/", es: "/es", "x-default": "/" },
  },
  category: "education technology",
  creator: "MoodlIA",
  publisher: "MoodlIA",
  icons: { icon: "/favicon.svg" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "MoodlIA — Make Moodle work for you.",
    description:
      "Plan learning, teach with more time, and know where to help next—with practical MoodlIA tools and direct human help.",
    url: "https://moodlia.com",
    siteName: "MoodlIA",
    locale: "en_US",
    images: [{ url: "/moodlia-educators-together-v2.jpg", width: 1536, height: 1024, alt: "Educators working together with MoodlIA" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodlIA — Make Moodle work for you.",
    description:
      "Plan learning, teach with more time, and know where to help next—with practical MoodlIA tools and direct human help.",
    images: ["/moodlia-educators-together-v2.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
      >
        <script
          id="impeccable-design-contract"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(designContract).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
