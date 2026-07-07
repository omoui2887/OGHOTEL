import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import {
  APP_NAME,
  APP_DESCRIPTION,
  APP_LOCALE,
} from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Gestion d'hôtels & résidences en Côte d'Ivoire`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "OGHOTEL",
    "gestion hôtel",
    "résidence meublée",
    "Côte d'Ivoire",
    "réservation",
    "check-in",
    "FCFA",
    "SaaS",
  ],
  authors: [{ name: APP_NAME }],
  openGraph: {
    title: `${APP_NAME} — Gestion d'hôtels & résidences`,
    description: APP_DESCRIPTION,
    locale: APP_LOCALE,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            {children}
          </div>
          <SonnerToaster richColors position="top-right" />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
