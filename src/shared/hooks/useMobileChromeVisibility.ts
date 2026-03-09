import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  MOBILE_CHROME_MEDIA_QUERY,
  MOBILE_CHROME_THRESHOLDS,
  type ScrollDirection,
} from '@/shared/config/mobileChrome'

type ChromeThresholds = typeof MOBILE_CHROME_THRESHOLDS

interface ChromeStepInput {
  currentY: number
  maxScroll: number
  lastY: number
  direction: ScrollDirection
  directionTravel: number
  visible: boolean
  thresholds?: ChromeThresholds
}

interface ChromeStepOutput {
  visible: boolean
  lastY: number
  direction: ScrollDirection
  directionTravel: number
}

export function computeNextChromeState({
  currentY,
  maxScroll,
  lastY,
  direction,
  directionTravel,
  visible,
  thresholds = MOBILE_CHROME_THRESHOLDS,
}: ChromeStepInput): ChromeStepOutput {
  const y = Math.max(currentY, 0)
  const delta = y - lastY
  if (Math.abs(delta) < thresholds.minDelta) {
    return { visible, lastY, direction, directionTravel }
  }

  const nearTop = y <= thresholds.nearTop
  const nearBottom = Math.max(maxScroll, 0) - y <= thresholds.nearBottom
  if (nearTop || nearBottom) {
    return {
      visible: true,
      lastY: y,
      direction: 0,
      directionTravel: 0,
    }
  }

  const nextDirection: ScrollDirection = delta > 0 ? 1 : -1
  const baseTravel = nextDirection === direction ? directionTravel : 0
  const nextTravel = baseTravel + Math.abs(delta)

  if (nextDirection === 1 && visible && nextTravel > thresholds.hideDelta) {
    return {
      visible: false,
      lastY: y,
      direction: nextDirection,
      directionTravel: 0,
    }
  }
  if (nextDirection === -1 && !visible && nextTravel > thresholds.showDelta) {
    return {
      visible: true,
      lastY: y,
      direction: nextDirection,
      directionTravel: 0,
    }
  }

  return {
    visible,
    lastY: y,
    direction: nextDirection,
    directionTravel: nextTravel,
  }
}

interface UseMobileChromeVisibilityOptions {
  pathname: string
  scrollerRef: RefObject<HTMLElement | null>
}

export function useMobileChromeVisibility({
  pathname,
  scrollerRef,
}: UseMobileChromeVisibilityOptions) {
  const [visible, setVisible] = useState(true)

  const visibleRef = useRef(true)
  const lastYRef = useRef(0)
  const directionRef = useRef<ScrollDirection>(0)
  const directionTravelRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const scroller = scrollerRef.current
    const commitVisibility = (nextVisible: boolean) => {
      if (visibleRef.current === nextVisible) return
      visibleRef.current = nextVisible
      setVisible(nextVisible)
    }

    scroller?.scrollTo({ top: 0, behavior: 'auto' })
    commitVisibility(true)
    directionRef.current = 0
    directionTravelRef.current = 0
    lastYRef.current = scroller?.scrollTop ?? 0
  }, [pathname, scrollerRef])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    lastYRef.current = scroller.scrollTop
    directionRef.current = 0
    directionTravelRef.current = 0

    const commitVisibility = (nextVisible: boolean) => {
      if (visibleRef.current === nextVisible) return
      visibleRef.current = nextVisible
      setVisible(nextVisible)
    }

    const onScroll = () => {
      if (!window.matchMedia(MOBILE_CHROME_MEDIA_QUERY).matches) {
        commitVisibility(true)
        return
      }
      if (rafRef.current != null) return

      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null

        const next = computeNextChromeState({
          currentY: scroller.scrollTop,
          maxScroll: scroller.scrollHeight - scroller.clientHeight,
          lastY: lastYRef.current,
          direction: directionRef.current,
          directionTravel: directionTravelRef.current,
          visible: visibleRef.current,
        })

        lastYRef.current = next.lastY
        directionRef.current = next.direction
        directionTravelRef.current = next.directionTravel
        commitVisibility(next.visible)
      })
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [scrollerRef])

  return visible
}
