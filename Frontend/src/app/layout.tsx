import { cormorant, inter } from "./fonts";
import "../styles/globals.css";

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
        <main>{children}</main>
      </body>
    </html>
  );
}
