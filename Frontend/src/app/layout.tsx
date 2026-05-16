import { Cormorant_Garamond, Inter } from "next/font/google";
import '../styles/globals.css';


const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-public-display",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-public-body",
});


export { cormorant, inter };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${cormorant.variable} ${inter.variable} public-body bg-[rgba(177,141,97,0.14)] antialiased flex flex-col min-h-screen`}
      >
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
