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
  title: "MoodlIA — One Moodle. Three ways forward.",
  description:
    "MoodlIA brings AI, practical teaching tools, and clear learning insights to Moodle. Explore three connected ways to move forward and get direct help when you need it.",
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
    title: "MoodlIA — One Moodle. Three ways forward.",
    description:
      "Connect with AI, teach with confidence, and see what matters—with direct help whenever you need it.",
    url: "https://moodlia.com",
    siteName: "MoodlIA",
    locale: "en_US",
    images: [{ url: "/moodlia-educators-together-v2.jpg", width: 1536, height: 1024, alt: "Educators working together with MoodlIA" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoodlIA — One Moodle. Three ways forward.",
    description:
      "Connect with AI, teach with confidence, and see what matters—with direct help whenever you need it.",
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
          id="moodlia-page-arrival"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(sessionStorage.getItem("moodlia-page-transition")==="entering"){sessionStorage.removeItem("moodlia-page-transition");document.documentElement.dataset.pageTransition="entering";setTimeout(function(){delete document.documentElement.dataset.pageTransition},360)}}catch(error){}})();`,
          }}
        />
        <script
          id="moodlia-page-navigation"
          dangerouslySetInnerHTML={{
            __html: `(function(){var duration=140;var storageKey="moodlia-page-transition";function supportsNativeTransition(){return typeof document.startViewTransition==="function"}function shouldHandle(event,anchor){if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return false;if(anchor.target&&anchor.target!=="_self"||anchor.hasAttribute("download"))return false;var destination=new URL(anchor.href,window.location.href);if(destination.origin!==window.location.origin)return false;return destination.pathname!==window.location.pathname||destination.search!==window.location.search}function handleNavigation(event){var target=event.target;if(!(target instanceof Element))return;var anchor=target.closest("a");if(!(anchor instanceof HTMLAnchorElement)||!shouldHandle(event,anchor))return;if(supportsNativeTransition()||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;event.preventDefault();if(document.documentElement.dataset.pageTransition==="leaving")return;try{sessionStorage.setItem(storageKey,"entering")}catch(error){}document.documentElement.dataset.pageTransition="leaving";setTimeout(function(){window.location.assign(anchor.href)},duration)}document.addEventListener("click",handleNavigation)})();`,
          }}
        />
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
