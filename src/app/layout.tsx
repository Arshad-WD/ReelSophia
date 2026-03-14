import type { Metadata, Viewport } from "next";
import { Outfit, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import { AppLayout } from "@/components/app-layout";
import { UIProvider } from "@/lib/ui-context";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans", display: 'swap' });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-heading", display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: 'swap' });

export const metadata: Metadata = {
  title: "ReelSophia — Knowledge from Reels",
  description:
    "Extract structured knowledge from social media reels. Your personal AI-powered learning journal.",
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
  themeColor: "#0f0d15",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} ${dmSerif.variable} ${jetBrainsMono.variable} font-sans antialiased text-foreground bg-background overflow-x-hidden`} suppressHydrationWarning>
        <UIProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </UIProvider>
      </body>
    </html>
  );
}
