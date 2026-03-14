import type { Metadata } from "next";
import { Pangolin } from "next/font/google";
import "./globals.css";


const pangolin = Pangolin({
  subsets: ["latin", "cyrillic"], 
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Эден",
  description: "Салон красоты",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pangolin.className} antialiased flex flex-col min-h-screen`}
      >
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
