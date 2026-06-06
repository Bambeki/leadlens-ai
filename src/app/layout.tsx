import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeadLens AI — Vehicle Branding Intelligence",
  description:
    "Discover, score, and approach high-value fleet branding prospects with AI-powered Vehicle Branding Intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-saas-bg antialiased`}
    >
      <body className="min-h-full bg-saas-bg text-white">{children}</body>
    </html>
  );
}
