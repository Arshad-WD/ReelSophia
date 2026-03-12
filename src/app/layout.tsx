import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Outfit, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-heading" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#f59e0b",
          colorBackground: "#0f0d15",
          colorText: "#e2e0e7",
          colorTextSecondary: "#8a8694",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "velvet-card border border-white/10",
          navbar: "hidden",
          footer: "hidden",
          footerAction: "hidden",
          headerTitle: "font-heading font-bold text-2xl",
          headerSubtitle: "text-muted-foreground font-sans",
          formFieldLabel: "text-muted-foreground font-medium text-xs uppercase tracking-wider",
          formFieldInput: "bg-white/5 border-white/10 focus:border-primary text-white rounded-xl",
          formButtonPrimary: "btn-primary",
          footerActionText: "text-muted-foreground",
          footerActionLink: "text-primary hover:text-primary/80 font-semibold",
          identityPreviewText: "text-foreground",
          identityPreviewEditButtonIcon: "text-primary",
          internal_developmentMode: "hidden opacity-0 pointer-events-none",
        }
      }}
    >
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${outfit.variable} ${dmSerif.variable} ${jetBrainsMono.variable} font-sans antialiased text-foreground bg-background overflow-x-hidden`} suppressHydrationWarning>
          <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <DesktopNav />

            {/* Main Content */}
            <main className="flex-1 relative z-10 lg:pl-72 transition-all duration-500">
              <div className="max-w-[1400px] mx-auto min-h-screen">
                {children}
              </div>
            </main>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <BottomNav />
          </div>

          <Toaster
            position="top-center"
            toastOptions={{
              className: "velvet-card border-border/50 font-sans text-sm",
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
