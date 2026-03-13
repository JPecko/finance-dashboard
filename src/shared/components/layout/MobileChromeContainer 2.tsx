import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MobileChromeContainerProps {
  children: ReactNode
  visible: boolean
  placement: 'top' | 'bottom'
}

export default function MobileChromeContainer({
  children,
  visible,
  placement,
}: MobileChromeContainerProps) {
  return (
    <div
      className={cn(
        'mobile-chrome',
        placement === 'top' ? 'mobile-chrome-top' : 'mobile-chrome-bottom',
        visible ? 'mobile-chrome-visible' : 'mobile-chrome-hidden',
      )}
    >
      {children}
    </div>
  )
}

