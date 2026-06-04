import type { Metadata } from "next";
import "./globals.css";
import { Playfair_Display, Lato } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700', '900'],
  variable: '--font-playfair', // A name for the CSS variable
});

const lato = Lato({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '700'],
  variable: '--font-lato', // A name for the CSS variable
});

export const metadata: Metadata = {
  title: "Kalkulator Dapur Ibu — Optimasi Produksi Kue",
  description: "Aplikasi Linear Programming Metode Grafis untuk optimasi produksi Nastar & Kastengel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${playfair.variable} ${lato.variable} paper-texture`}>
        {children}
      </body>
    </html>
  );
}
