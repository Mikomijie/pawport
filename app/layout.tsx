import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PawPort — Digital Passport for Your Cat",
  description: "Register your cat, get a QR code tag, and keep them safe. Instant profile access for anyone who finds your cat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
