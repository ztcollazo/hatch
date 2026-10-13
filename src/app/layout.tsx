import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Professional Profile Hub",
  description: "Create and publish a polished Profile Page from one Professional Profile.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
