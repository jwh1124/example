import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nano Banana 2 Image Bot",
  description: "Gemini 3.1 Flash Image 기반 이미지 생성 및 편집 도구",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
