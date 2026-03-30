import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import AsciiHeader from "@/components/AsciiHeader";
import Footer from "@/components/Footer";
import AsciiCursor from "@/components/AsciiCursor";
import { ScrollProvider } from "@/context/ScrollContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Kyuho Lee",
    template: "%s — Kyuho Lee",
  },
  description:
    "Designer, engineer, and creative — crafting experiences that scale, resonate, and endure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ScrollProvider>
          <AsciiHeader />
          <AsciiCursor />
          <main>{children}</main>
          <Footer />
        </ScrollProvider>
      </body>
    </html>
  );
}
