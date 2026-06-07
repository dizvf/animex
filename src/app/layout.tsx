import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "AnimeX — Watch Anime Free", template: "%s · AnimeX" },
  description: "Stream thousands of anime series and movies in HD with no ads.",
  keywords: ["anime", "watch anime", "anime streaming", "free anime"],
  openGraph: {
    type: "website",
    siteName: "AnimeX",
    images: ["/og-image.png"],
  },
  themeColor: "#E85D04",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#17171A",
                color: "#fff",
                border: "1px solid #2A2A30",
                borderRadius: "10px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}