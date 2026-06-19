import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { YandexMetrika } from '@/components/yandex-metrika'
import { MetaPixel } from '@/components/meta-pixel'
import { getSettings } from '@/lib/settings'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: 'WorkInRB | Работа в Москве для белорусов | 100 BYN/день',
  description: 'Подсобные работы на стройке в Москве и области для мужчин из Беларуси. Зарплата 100 BYN/день, бесплатное жилье и питание. Вахта от 30 дней. Честные условия.',
  metadataBase: new URL('https://workinrb.top'),
  keywords: ['работа в москве', 'вахта', 'подсобные работы на стройке', 'разнорабочий на стройку', 'работа для белорусов', 'вахтовый метод', 'workinrb'],
  openGraph: {
    title: 'WorkInRB | Работа в Москве для белорусов',
    description: 'Подсобные работы на стройке. 100 BYN/день. Жилье + питание бесплатно. Только для мужчин.',
    url: 'https://workinrb.top',
    siteName: 'WorkInRB',
    locale: 'ru_RU',
    type: 'website',
  },
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0d14',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings()

  return (
    <html lang="ru" className="bg-background">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <YandexMetrika enabled={settings.yandexMetrikaEnabled} counterId={settings.yandexMetrikaId} />
        <MetaPixel enabled={settings.metaPixelEnabled} pixelId={settings.metaPixelId} />
      </body>
    </html>
  )
}
