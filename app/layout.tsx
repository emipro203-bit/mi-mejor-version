import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Mi Mejor Versión",
  description: "Tu tracker personal de hábitos, metas y métricas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mi Mejor Versión",
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0B08",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen">
              <div className="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8">
                {children}
              </div>
            </main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
