import "./globals.css";

import Header from "@/components/Header";

export const metadata = {
  title: "DEFENSE SEMI B2B MARKET",
  description: "Semiconductor Intelligence + Sourcing",
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
      </body>
    </html>
  );
}