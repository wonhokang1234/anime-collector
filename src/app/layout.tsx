import type { Metadata } from "next";
import {
  Geist_Mono,
  Cormorant_Garamond,
  Inter,
  Zen_Old_Mincho,
  Zen_Kaku_Gothic_New,
  DotGothic16,
} from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { MotionProvider } from "@/components/motion-provider";
import { Navbar } from "@/components/navbar";
import { PageTransition } from "@/components/page-transition";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toast } from "@/components/ui/toast";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const zenMincho = Zen_Old_Mincho({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-mincho",
  display: "swap",
});

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-kaku",
  display: "swap",
});

const dotGothic = DotGothic16({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dot",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Karuta",
  description: "A premium anime and manga collection tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${geistMono.variable} ${zenMincho.variable} ${zenKaku.variable} ${dotGothic.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}
      >
        <AuthProvider>
          <MotionProvider>
            <Navbar />
            <main className="flex-1">
              <ErrorBoundary>
                <PageTransition>{children}</PageTransition>
              </ErrorBoundary>
            </main>
            <Toast />
          </MotionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
