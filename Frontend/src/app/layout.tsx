import type { Metadata } from "next";
import { Pangolin } from "next/font/google";
import { Poiret_One } from "next/font/google";
import "./globals.css";


const pangolin = Pangolin({
  subsets: ["latin", "cyrillic"], 
  weight: "400",
  display: "swap",
});

const poiter = Poiret_One({
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
        className={`${poiter.className} antialiased flex flex-col min-h-screen bg-black`}
      >
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
