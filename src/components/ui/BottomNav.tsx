'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Settings, LayoutGrid } from 'lucide-react'

const tabs = [
  { href: '/',          icon: LayoutGrid,   label: 'スケジュール' },
  { href: '/calendar',  icon: CalendarDays, label: 'カレンダー' },
  { href: '/settings',  icon: Settings,     label: '設定' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="glass border-t border-slate-800/50 flex items-stretch pb-safe-bottom z-20 flex-shrink-0">
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} className={`nav-tab flex-1 ${active ? 'active' : ''}`}>
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
