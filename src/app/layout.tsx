import type { Metadata } from "next";
import { Inter } from "next/font/google"
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(inter.className, "antialiased min-h-screen")}
      >
        {children}
      </body>
    </html>
  );
}
