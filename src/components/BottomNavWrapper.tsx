'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/',          label: 'Home',      icon: 'home'          },
  { href: '/khata',     label: 'Khata',     icon: 'menu_book'     },
  { href: '/customers', label: 'Customers', icon: 'group'         },
  { href: '/analytics', label: 'Analytics', icon: 'insert_chart'  },
  { href: '/settings',  label: 'Settings',  icon: 'settings'      },
]

export default function BottomNavWrapper() {
  const pathname = usePathname()
  if (pathname === '/login') return null

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-[2.5rem] bg-white/80 backdrop-blur-2xl md:hidden"
      style={{ boxShadow: '0 -10px 40px rgba(67,56,202,0.08)' }}>
      <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-2xl
                transition-all duration-200 active:scale-90
                ${isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-400 hover:text-gray-600'}`}
            >
              <span
                className="material-symbols-outlined mb-1"
                style={isActive
                  ? { fontVariationSettings: "'FILL' 1" }
                  : { fontVariationSettings: "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-label text-[10px] font-medium tracking-wide uppercase">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}