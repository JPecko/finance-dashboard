import { NavLink } from 'react-router-dom'
import { navItems } from '@/shared/config/nav'
import { useT } from '@/shared/i18n'

const MOBILE_NAV_ORDER = ['/dashboard', '/transactions', '/accounts', '/recurring', '/settings']
const mobileNavItems = MOBILE_NAV_ORDER.map(to => navItems.find(n => n.to === to)!)

export default function BottomNav() {
  const t = useT()

  return (
    <nav className="lg:hidden flex items-stretch border-t border-border bg-sidebar safe-area-bottom-pad-3">
      {mobileNavItems.map(({ to, labelKey, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className="group/tab flex flex-1 flex-col items-center gap-1 pb-2 pt-3 transition-colors text-muted-foreground hover:text-foreground [&.active]:text-primary"
        >
          <span className="h-0.5 w-5 rounded-full bg-current opacity-0 group-[.active]/tab:opacity-100 transition-opacity" />
          <Icon className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-none">{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}

