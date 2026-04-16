import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel, Noto_Serif_JP } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Anime Collector",
  description: "Collect anime as stylized cards and organize them on your shelf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${notoSerifJp.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
