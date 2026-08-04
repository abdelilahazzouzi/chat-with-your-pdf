import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat With Your PDF — Instant AI Document Intelligence",
  description: "Upload any PDF and ask questions, generate summaries, and extract insights powered by Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="ambient-bg" />
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
