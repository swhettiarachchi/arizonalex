import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { AuthGateProvider } from "@/components/providers/AuthGuard";
import HashTokenInterceptor from "@/components/auth/HashTokenInterceptor";
import AppShell from "./AppShell";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Arizonalex | The Premier Network for Politics, Business & Crypto",
  description: "Join Arizonalex, the leading AI-powered social platform connecting global professionals, thought leaders, and enthusiasts in politics, business, finance, and cryptocurrency.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <HashTokenInterceptor />
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <AuthGateProvider>
                <AppShell>{children}</AppShell>
              </AuthGateProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
