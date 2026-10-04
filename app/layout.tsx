import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

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
    { media: "(prefers-color-scheme: light)", color: "#f5f8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1a1b" },
  ],
};

// Copy buttons on code blocks. Static pages ship no client components, so this is the only script.
const copyScript = `document.addEventListener("click",function(e){var b=e.target.closest("[data-copy]");if(!b||!navigator.clipboard)return;var c=b.parentElement.querySelector("code");if(!c)return;navigator.clipboard.writeText(c.innerText).then(function(){var l=b.textContent;b.textContent=b.getAttribute("data-copied-label")||l;setTimeout(function(){b.textContent=l},1600)})});`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable}`}>
        {children}
        <script dangerouslySetInnerHTML={{ __html: copyScript }} />
      </body>
    </html>
  );
}
