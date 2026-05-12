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
  // Isso ajuda o Next.js a montar os links das imagens sozinho
  metadataBase: new URL('https://topazio-site.vercel.app'),
  
  title: 'Topázio Ambientes Planejados | Móveis Sob Medida em Maringá',
  description: 'Móveis planejados de alto padrão em Maringá-PR. 17 anos de tradição, qualidade e acabamento impecável.',
  keywords: ['móveis planejados Maringá', 'Topázio Ambientes', 'marcenaria Maringá', 'cozinha planejada'],
  
  openGraph: {
    title: 'Topázio Ambientes Planejados',
    description: 'Qualidade, precisão e acabamento em cada detalhe.',
    url: 'https://topazio-site.vercel.app',
    siteName: 'Topázio Planejados',
    images: [
      {
        url: '/logo-topazio.png', // O Next.js busca dentro da pasta public
        width: 1200,
        height: 630,
        alt: 'Topázio Ambientes Planejados',
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