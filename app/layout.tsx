import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansThai = Noto_Sans_Thai({ 
  subsets: ["thai"], 
  variable: "--font-noto-sans-thai",
  weight: ["300", "400", "500", "600", "700"] 
});

export const metadata: Metadata = {
  title: "แจกวาร์ปขึ้นจอ At Sign Club ระบบ PubCast+",
  description: "ระบบแจกวาร์ป แจกทิป Donate ขึ้นจอ และ Live Stream",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${notoSansThai.variable} font-sans antialiased bg-[#F7F7F9]`}>
        {children}
      </body>
    </html>
  );
}
