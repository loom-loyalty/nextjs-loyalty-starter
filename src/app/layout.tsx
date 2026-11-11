import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loyalty storefront starter",
  description: "A storefront member page and shopper chat on Loom Loyalty and the Vercel AI SDK.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-border bg-surface">
          <nav
            aria-label="Main"
            className="mx-auto flex w-full max-w-3xl items-center gap-6 px-4 py-3"
          >
            <span className="font-semibold">Your Store</span>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
            >
              My rewards
            </Link>
            <Link
              href="/assistant"
              className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
            >
              Ask the assistant
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
        <footer className="mx-auto w-full max-w-3xl px-4 py-6 text-xs text-muted">
          Rewards by Loom Loyalty
        </footer>
      </body>
    </html>
  );
}
