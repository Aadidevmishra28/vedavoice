'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/',        label: 'Hisaab',  icon: 'dashboard'          },
  { href: '/hajiri',  label: 'Hajiri',  icon: 'record_voice_over'  },
  { href: '/workers', label: 'Mazdoor', icon: 'groups'             },
  { href: '/khata',   label: 'Ledger',  icon: 'receipt_long'       },
  { href: '/saathi',  label: 'Ask AI',  icon: 'query_stats'        },
]

export default function BottomNavWrapper() {
  const pathname = usePathname()
  if (pathname === '/login') return null

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-2 pb-8 pt-3 bg-white/90 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(55,48,163,0.08)] rounded-t-[2.5rem]">
      {navItems.map(item => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-2xl transition-all duration-200 active:scale-95
              ${isActive
                ? 'bg-indigo-50 text-indigo-800'
                : 'text-slate-400 hover:text-indigo-600'}`}
          >
            <span
              className="material-symbols-outlined mb-1"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="font-headline text-[10px] font-bold uppercase tracking-wider">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}