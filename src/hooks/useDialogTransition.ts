import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useEffect, type RefObject } from 'react'
import { motionBudget } from './usePrefersReducedMotion'

/** Blurred while a dialog is open, so the panel is the only thing in focus. */
const BACKDROP_SELECTOR =
  '.page, .footer, .back-to-top, .island--nav, .settings'

interface Options {
  panel: RefObject<HTMLDivElement | null>
  scrim: RefObject<HTMLDivElement | null>
  /** Where the control that opened it sat, so the panel grows out of it. */
  origin: DOMRect | null
  /** Focused on open, and the thing the user tabs to first on the way out. */
  initialFocus: RefObject<HTMLElement | null>
  onClose: () => void
}

/**
 * Opening and closing shared by every dialog on the page: the panel grows out
 * of whatever was clicked, the page behind blurs and stops scrolling, Escape
 * closes, and closing runs the whole thing backwards.
 *
 * Returns the dismiss function; the caller owns the markup.
 */
export function useDialogTransition({
  panel,
  scrim,
  origin,
  initialFocus,
  onClose,
}: Options) {
  useGSAP(() => {
    const node = panel.current
    const veil = scrim.current
    if (!node || !veil) return

    const budget = motionBudget()
    const behind = gsap.utils.toArray<HTMLElement>(BACKDROP_SELECTOR)
    const duration = budget.duration(0.55)

    gsap.to(veil, { autoAlpha: 1, duration, ease: 'power2.inOut' })
    gsap.to(behind, {
      filter: 'blur(9px)',
      duration,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })

    if (budget.reduced || !origin) {
      gsap.fromTo(
        node,
        { autoAlpha: 0, scale: budget.reduced ? 1 : 0.96 },
        { autoAlpha: 1, scale: 1, duration, ease: 'power2.inOut' },
      )
      return
    }

    // Measure where the panel has landed, then start it back at the control.
    const target = node.getBoundingClientRect()
    const scale = Math.max(0.2, origin.width / target.width)

    gsap.fromTo(
      node,
      {
        autoAlpha: 0,
        x: origin.left - target.left,
        y: origin.top - target.top,
        scale,
        transformOrigin: 'top left',
      },
      { autoAlpha: 1, x: 0, y: 0, scale: 1, duration, ease: 'power2.inOut' },
    )
    const body = node.querySelector('.dialog__body')
    if (body) {
      gsap.from(body, {
        autoAlpha: 0,
        duration: budget.duration(0.4),
        delay: budget.duration(0.16),
        ease: 'power2.out',
      })
    }
  }, [])

  const dismiss = () => {
    const node = panel.current
    const veil = scrim.current
    const budget = motionBudget()
    const behind = gsap.utils.toArray<HTMLElement>(BACKDROP_SELECTOR)
    const duration = budget.duration(0.4)

    gsap.to(behind, {
      filter: 'blur(0px)',
      duration,
      ease: 'power2.inOut',
      overwrite: 'auto',
      onComplete: () => gsap.set(behind, { clearProps: 'filter' }),
    })
    if (veil) gsap.to(veil, { autoAlpha: 0, duration, ease: 'power2.inOut' })
    if (!node) return onClose()

    const shrink =
      !budget.reduced && origin
        ? (() => {
            const target = node.getBoundingClientRect()
            return {
              x: origin.left - target.left,
              y: origin.top - target.top,
              scale: Math.max(0.2, origin.width / target.width),
              transformOrigin: 'top left',
            }
          })()
        : { scale: budget.reduced ? 1 : 0.97 }

    gsap.to(node, {
      ...shrink,
      autoAlpha: 0,
      duration,
      ease: 'power2.inOut',
      onComplete: onClose,
    })
  }

  // Escape closes it, the page behind stays put, and focus starts on the way out.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss()
    }
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    initialFocus.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return dismiss
}
