import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Finanças do Casal',
  description: 'Gestão Patrimonial e Financeira',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png?v=2', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png?v=2', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'shortcut icon', url: '/icon-192.png?v=2' },
    ],
  },
  openGraph: {
    title: 'Finanças do Casal',
    description: 'Gestão Patrimonial e Financeira',
    images: [{ url: '/icon-512.png?v=2', width: 512, height: 512 }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0B1F33',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icon-192.png?v=2" />
        <link rel="apple-touch-icon" href="/icon-192.png?v=2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Finanças" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F7F5F0]`}
      >
        {children}
      </body>
    </html>
  );
}