import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAccountPrefsStore } from '@/shared/store/accountPrefsStore'
import BottomNav from '@/shared/components/layout/BottomNav'
import MobileHeader from '@/shared/components/layout/MobileHeader'
import MobileChromeContainer from '@/shared/components/layout/MobileChromeContainer'
import { useMobileChromeVisibility } from '@/shared/hooks/useMobileChromeVisibility'

export default function Layout() {
  const load = useAccountPrefsStore(s => s.load)
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement | null>(null)
  const mobileChromeVisible = useMobileChromeVisibility({ pathname, scrollerRef: mainRef })

  useEffect(() => { void load() }, [load])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileChromeContainer visible={mobileChromeVisible} placement="top">
          <MobileHeader />
        </MobileChromeContainer>

        <main ref={mainRef} className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <MobileChromeContainer visible={mobileChromeVisible} placement="bottom">
          <BottomNav />
        </MobileChromeContainer>
      </div>
    </div>
  )
}
