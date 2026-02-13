import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SSH Terminal - Web-based SSH Client",
  description: "Modern web-based SSH terminal client with multi-tab support, session management, and beautiful themes. Connect to your servers securely from anywhere.",
  keywords: ["SSH", "Terminal", "Web Terminal", "SSH Client", "Remote Server", "DevOps", "Server Management"],
  authors: [{ name: "SSH Terminal Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "SSH Terminal",
    description: "Modern web-based SSH terminal client",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
