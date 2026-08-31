import { useCallback } from 'react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { prefersReducedMotionNow } from './usePrefersReducedMotion'

gsap.registerPlugin(ScrollToPlugin)

/**
 * True while a scroll started by the navigation is still running, plus a short
 * grace period afterwards.
 *
 * The floating island hides on downward scroll, and a click on "Contact"
 * scrolls downward — without this it would hide the control the visitor just
 * used, mid-journey.
 *
 * The grace period matters: scroll handlers read on the next animation frame,
 * so a frame scheduled during the tween can run after it has finished and
 * compare against a position several hundred pixels back. On a slow device that
 * one stale frame was enough to hide the island anyway.
 */
const SETTLE_MS = 250
let programmaticUntil = 0
let programmaticActive = false

export function isProgrammaticScroll(): boolean {
  return programmaticActive || performance.now() < programmaticUntil
}

function beginProgrammatic() {
  programmaticActive = true
}

function endProgrammatic() {
  programmaticActive = false
  programmaticUntil = performance.now() + SETTLE_MS
}

/**
 * Smooth, short scroll to a section. Fast on purpose: navigation should feel
 * like a cut, not like a ride. Honours reduced-motion by jumping instantly.
 */
/** Clearance for the floating island, which sits on top on desktop and at the
 *  bottom on mobile. */
function navOffset(): number {
  if (typeof window === 'undefined') return 0
  return window.matchMedia('(max-width: 720px)').matches ? 28 : 96
}

/**
 * Layout position of an element in the document, ignoring transforms.
 *
 * Sections carry a scroll-scrubbed `translateY` (see `useSectionTransitions`),
 * so their rendered position is not where they will settle. Handing the element
 * itself to ScrollToPlugin resolved that moving position and landed the page
 * about 40px off every time. `offsetTop` reports the laid-out position, which
 * the transform does not touch.
 */
function layoutTop(element: HTMLElement): number {
  let top = 0
  let node: HTMLElement | null = element
  while (node) {
    top += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return top
}

export function useScrollTo() {
  return useCallback((targetId: string, onComplete?: () => void) => {
    const target =
      targetId === 'top' ? 0 : document.getElementById(targetId)
    if (target === null) {
      onComplete?.()
      return
    }

    const y =
      target === 0 ? 0 : Math.max(0, layoutTop(target as HTMLElement) - navOffset())

    if (prefersReducedMotionNow()) {
      beginProgrammatic()
      window.scrollTo({ top: y, behavior: 'auto' })
      endProgrammatic()
      onComplete?.()
      return
    }

    beginProgrammatic()
    const release = () => {
      endProgrammatic()
      onComplete?.()
    }

    gsap.to(window, {
      duration: 0.72,
      ease: 'power3.inOut',
      scrollTo: {
        y,
        // Never autoKill. On a touch screen the slight movement of a real tap
        // registers as "the user is scrolling", which cancelled the tween
        // partway: taps on the island and on "back to top" left you stranded
        // somewhere in the middle of the page.
        autoKill: false,
      },
      overwrite: 'auto',
      onComplete: release,
      onInterrupt: release,
    })
  }, [])
}
