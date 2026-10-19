import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./cinematic.css";
import "./editorial.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });
const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://moodlia.com"),
  category: "education technology",
  creator: "MoodlIA",
  publisher: "MoodlIA",
  icons: { icon: "/favicon.svg" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0efeb" },
    { media: "(prefers-color-scheme: dark)", color: "#191a19" },
  ],
};

// Copy buttons on code blocks; homepage motion is progressively enhanced separately.
const copyScript = `document.addEventListener("click",function(e){var b=e.target.closest("[data-copy]");if(!b||!navigator.clipboard)return;var c=b.parentElement.querySelector("code");if(!c)return;navigator.clipboard.writeText(c.innerText).then(function(){var l=b.textContent;b.textContent=b.getAttribute("data-copied-label")||l;setTimeout(function(){b.textContent=l},1600)})});`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} ${display.variable}`}>
        {children}
        <script dangerouslySetInnerHTML={{ __html: copyScript }} />
      </body>
    </html>
  );
}
