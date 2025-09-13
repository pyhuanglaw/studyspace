import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "每日讀書時間紀錄",
  description: "Daily study time tracker with morning and afternoon sessions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
