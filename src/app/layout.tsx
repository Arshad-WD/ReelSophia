import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Inter, Lora, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ReelSophia — Transform Reels into Knowledge",
  description:
    "Convert informative social media reels into structured, searchable knowledge notes. Stop scrolling, start learning.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ReelSophia",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#dc2743", 
          colorBackground: "#000000",
          borderRadius: "12px",
        },
        elements: {
          card: "journal-card",
        }
      }}
    >
      <html lang="en" className="dark">
        <body className={`${inter.variable} font-sans antialiased text-foreground bg-background`}>
          <main className="min-h-screen pb-24 safe-top relative z-10">
            {children}
          </main>

          <BottomNav />
          <Toaster
            position="top-center"
            toastOptions={{
              className: "journal-card",
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
