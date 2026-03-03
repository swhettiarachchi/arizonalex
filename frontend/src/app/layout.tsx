import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AuthGateProvider } from "@/components/providers/AuthGuard";
import AppShell from "./AppShell";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Arizonalex – Political Social Platform",
  description: "AI-powered political social media platform for governance, leadership, and public engagement.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <AuthGateProvider>
              <AppShell>{children}</AppShell>
            </AuthGateProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
