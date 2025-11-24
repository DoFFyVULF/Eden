import type { Metadata } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";
import "./globals.css";


const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-m-plus-rounded",
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
        className={`${mPlusRounded.variable} antialiased flex flex-col min-h-screen`}
      >
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
