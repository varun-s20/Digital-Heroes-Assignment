import type { Metadata } from "next";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
// @ts-ignore
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Digital Heroes — Play Golf, Support Charities, Win Prizes",
  description: "Subscribe monthly, enter your Stableford scores, and join our monthly prize draw while supporting your chosen charity.",
};

import { AuthProvider } from "@/context/AuthContext";
import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-bg text-text selection:bg-accent selection:text-black">
        <NextTopLoader color="#00E599" showSpinner={false} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

