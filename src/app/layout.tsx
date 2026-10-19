import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hatch",
  description: "Create and publish a polished profile page from one profile.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
