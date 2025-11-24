import { M_PLUS_Rounded_1c } from "next/font/google";
import Header from "../components/ui/public/header/Header";
import Footer from "../components/ui/public/footer/Footer";

const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-m-plus-rounded",
});

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${mPlusRounded.variable} antialiased flex flex-col min-h-screen bg-black`}
    >
      <Header />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
}
