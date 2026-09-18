import type { Metadata } from "next";

import "./globals.css";

import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "DEFENSE SEMI B2B MARKET",
  description:
    "Semiconductor Intelligence + Sourcing Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
