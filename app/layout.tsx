import type { Metadata } from "next";

import "./globals.css";

import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { InitialLoader } from "@/components/InitialLoader";
import { ScrollReveal } from "@/components/ScrollReveal";

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
        <InitialLoader />
        <ScrollReveal />
        <Header />
        <main>{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
