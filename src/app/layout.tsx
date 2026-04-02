import type { Metadata } from 'next'
import './globals.css'
import BottomNavWrapper from '@/components/BottomNavWrapper'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title:       'VedaVoice — Apni Dukaan Ka Hisaab',
  description: 'Apni dukaan ka hisaab, awaaz se',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-background text-on-surface min-h-screen">
        <div className="relative min-h-screen pb-20 md:pb-0 md:flex">

          {/* Desktop sidebar — hidden on /login via client component */}
          <Sidebar />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

          {/* Mobile bottom nav — hidden on /login via client component */}
          <BottomNavWrapper />
        </div>
      </body>
    </html>
  )
}