'use client'

import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/',          label: 'Home',      icon: 'home'         },
  { href: '/khata',     label: 'Khata',     icon: 'menu_book'    },
  { href: '/customers', label: 'Customers', icon: 'group'        },
  { href: '/analytics', label: 'Analytics', icon: 'insert_chart' },
  { href: '/settings',  label: 'Settings',  icon: 'settings'     },
]

export default function Sidebar() {
  const pathname = usePathname()
  if (pathname === '/login') return null

  return (
    <>
      {/* Fixed sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen fixed left-0 top-0
        bg-indigo-700 shadow-xl shadow-indigo-900/30 z-40">
        <div className="px-6 py-8 border-b border-indigo-600">
          <h1 className="font-headline font-extrabold text-xl text-white tracking-tight">
            VedaVoice
          </h1>
          <p className="text-indigo-300 text-xs mt-0.5">Smart Khata</p>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm
                  transition-colors font-label font-semibold
                  ${isActive
                    ? 'bg-white/15 text-white'
                    : 'text-indigo-200 hover:bg-indigo-600 hover:text-white'}`}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {item.label}
              </a>
            )
          })}
        </nav>
      </aside>

      {/* Invisible spacer to offset content on desktop */}
      <div className="hidden md:block w-60 shrink-0" />
    </>
  )
}
