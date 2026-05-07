import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Topázio Ambientes Planejados | Móveis Sob Medida em Maringá',
  description: 'Referência em móveis planejados em Maringá-PR. Cozinhas, dormitórios e ambientes corporativos com acabamento premium e 17 anos de tradição.',
  keywords: ['móveis planejados Maringá', 'Topázio Ambientes', 'marcenaria Maringá', 'cozinha planejada'],
  openGraph: {
    title: 'Topázio Ambientes Planejados',
    description: 'Qualidade, precisão e acabamento em cada detalhe.',
    url: 'https://topazio-ambientes.vercel.app', // COLOQUE SEU LINK AQUI
    siteName: 'Topázio Planejados',
    images: [
      {
        url: 'https://topazio-ambientes.vercel.app/logo-topazio.png', // LINK COMPLETO DA FOTO
        width: 1200,
        height: 630,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}