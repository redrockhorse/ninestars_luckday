import type { Metadata } from "next";
import "./globals.css";
import 'antd/dist/reset.css';

export const metadata: Metadata = {
  title: "九星気学 (Nine Stars Ki-gaku) Calculator",
  description: "Japanese Nine Stars Ki-gaku year/month/day family star chart calculator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
