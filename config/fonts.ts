import { Fira_Code as FontMono, Inter as FontSans, Poppins as FontPoppins } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const fontPoppins = FontPoppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ['normal'],
  subsets: ["latin"],
  display: "swap",
});