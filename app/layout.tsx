import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edge Case",
  description: "Not a bug - Just an edge case",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
