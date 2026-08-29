import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'

/**
 * Pointer tracking for the 3D character.
 *
 * Deliberately ref-based: nothing here ever calls `setState`, so the render
 * loop never triggers a React render. The hook only normalises the pointer and
 * damps it; how much each bone rotates is decided by the character component.
 */

export interface TrackingLimits {
  /** Radians. Eyes move most — they are what sells "it is looking at me". */
  MAX_EYE_ROTATION: number
  /** Radians. The head carries the bulk of the visible motion. */
  MAX_HEAD_ROTATION: number
  /** Radians. The neck follows a little. */
  MAX_NECK_ROTATION: number
  /** Radians. The torso barely moves — just enough to avoid a floating head. */
  MAX_TORSO_ROTATION: number
  /** Higher = snappier. Frame-rate independent (exponential smoothing). */
  DAMPING: number
}

export const TRACKING_LIMITS: TrackingLimits = {
  MAX_EYE_ROTATION: 0.26,
  MAX_HEAD_ROTATION: 0.42,
  MAX_NECK_ROTATION: 0.16,
  MAX_TORSO_ROTATION: 0.06,
  DAMPING: 5.2,
}

/** Vertical range is tighter than horizontal: necks nod less than they turn. */
export const VERTICAL_SCALE = 0.62

export interface Vec2 {
  x: number
  y: number
}

export interface MouseTracking {
  /** Raw normalised pointer, -1…1, origin at viewport centre. */
  target: RefObject<Vec2>
  /** Damped pointer actually used for rotations. */
  smoothed: RefObject<Vec2>
  /** Flip to false to freeze tracking (used during the greeting). */
  enabled: RefObject<boolean>
  /** True when the device has no real cursor — drives an idle drift instead. */
  coarsePointer: RefObject<boolean>
  /** Call once per frame; returns the damped value. */
  update: (delta: number, elapsed: number) => Vec2
}

interface Options {
  damping?: number
  /** Start disabled and hand control over once the greeting is done. */
  initiallyEnabled?: boolean
}

export function useMouseTracking(options: Options = {}): MouseTracking {
  const { damping = TRACKING_LIMITS.DAMPING, initiallyEnabled = false } = options

  const target = useRef<Vec2>({ x: 0, y: 0 })
  const smoothed = useRef<Vec2>({ x: 0, y: 0 })
  const enabled = useRef<boolean>(initiallyEnabled)
  const coarsePointer = useRef<boolean>(false)

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)')
    const syncPointerKind = () => {
      coarsePointer.current = !finePointer.matches
    }
    syncPointerKind()
    finePointer.addEventListener('change', syncPointerKind)

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      const { innerWidth, innerHeight } = window
      target.current.x = (event.clientX / innerWidth) * 2 - 1
      target.current.y = -((event.clientY / innerHeight) * 2 - 1)
    }

    // Losing the window should relax the character rather than freeze it.
    const onPointerLeave = () => {
      target.current.x = 0
      target.current.y = 0
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('blur', onPointerLeave)
    document.addEventListener('pointerleave', onPointerLeave)

    return () => {
      finePointer.removeEventListener('change', syncPointerKind)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('blur', onPointerLeave)
      document.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  const update = useCallback((delta: number, elapsed: number): Vec2 => {
    // Exponential smoothing: identical feel at 60fps and at 144fps.
    const alpha = 1 - Math.exp(-damping * Math.min(delta, 0.1))

    let goalX = 0
    let goalY = 0

    if (enabled.current) {
      if (coarsePointer.current) {
        // Touch devices have no cursor: a slow figure-eight keeps the character
        // alive without pretending to follow anything.
        goalX = Math.sin(elapsed * 0.34) * 0.35
        goalY = Math.sin(elapsed * 0.21) * 0.18
      } else {
        goalX = target.current.x
        goalY = target.current.y
      }
    }

    smoothed.current.x += (goalX - smoothed.current.x) * alpha
    smoothed.current.y += (goalY - smoothed.current.y) * alpha
    return smoothed.current
  }, [damping])

  // Stable identity: every field is a ref, so the object never needs to change.
  // Returning a fresh literal made it an unstable effect dependency, which is
  // how a theme toggle ended up restarting the greeting.
  return useMemo(
    () => ({ target, smoothed, enabled, coarsePointer, update }),
    [update],
  )
}
