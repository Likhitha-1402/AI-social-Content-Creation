import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreatorVerse AI - Ultimate Multi-Agent Content Studio",
  description: "Create, translate, edit, design, and schedule platform-specific social media posts with cooperative multi-agent workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
