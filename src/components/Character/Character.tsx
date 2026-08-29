import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { LoopOnce } from 'three'
import type { AnimationAction, Group } from 'three'
import { applyTracking, createTrackedParts, type TrackedPart } from './applyTracking'
import {
  collectAnimatedNodes,
  findClip,
  GREETING_PATTERN,
  IDLE_PATTERN,
  resolveBones,
} from './bones'
import { TRACKING_RAMP, type CharacterState } from './characterState'
import { useMouseTracking } from './useMouseTracking'

interface CharacterProps {
  url: string
  scale?: number
  position?: [number, number, number]
  /** When true the greeting and pointer tracking are skipped entirely. */
  reducedMotion?: boolean
  onStateChange?: (state: CharacterState) => void
}

/**
 * GLB-driven character. Renders whatever rig it is given: missing bones and
 * missing clips degrade gracefully instead of throwing.
 */
export function Character({
  url,
  scale = 1,
  position = [0, 0, 0],
  reducedMotion = false,
  onStateChange,
}: CharacterProps) {
  const group = useRef<Group>(null)
  const { scene, animations } = useGLTF(url)
  const { actions, mixer } = useAnimations(animations, group)

  const tracking = useMouseTracking({ initiallyEnabled: false })
  const parts = useRef<TrackedPart[]>([])
  const state = useRef<CharacterState>('initializing')
  const weight = useRef(0)

  const setState = (next: CharacterState) => {
    if (state.current === next) return
    state.current = next
    onStateChange?.(next)
  }

  // --- Rig discovery -------------------------------------------------------
  useEffect(() => {
    scene.traverse((node) => {
      node.frustumCulled = false
      if ('castShadow' in node) node.castShadow = true
    })
    parts.current = createTrackedParts(
      resolveBones(scene),
      collectAnimatedNodes(animations),
    )
  }, [scene, animations])

  // --- State machine -------------------------------------------------------
  useEffect(() => {
    const greetClip = findClip(animations, GREETING_PATTERN)
    const idleClip =
      findClip(animations, IDLE_PATTERN) ??
      animations.find((clip) => clip !== greetClip) ??
      null

    const greetAction = greetClip ? actions[greetClip.name] : null
    const idleAction = idleClip ? actions[idleClip.name] : null

    const startIdle = (fadeIn: number) => {
      idleAction?.reset().fadeIn(fadeIn).play()
      setState('idle')
      if (!reducedMotion) tracking.enabled.current = true
    }

    if (reducedMotion) {
      // Hold a still pose: play idle then immediately pause it on frame one.
      if (idleAction) {
        idleAction.reset().play()
        idleAction.paused = true
      }
      setState('idle')
      return () => {
        idleAction?.stop()
      }
    }

    let onFinished: ((event: { action: AnimationAction }) => void) | null = null

    if (greetAction) {
      setState('greeting')
      greetAction.reset()
      greetAction.setLoop(LoopOnce, 1)
      greetAction.clampWhenFinished = true
      greetAction.fadeIn(0.25).play()

      onFinished = (event) => {
        if (event.action !== greetAction) return
        greetAction.fadeOut(0.4)
        startIdle(0.4)
      }
      mixer.addEventListener('finished', onFinished as never)
    } else {
      // No greeting clip in the file — go straight to idle.
      startIdle(0.5)
    }

    return () => {
      if (onFinished) mixer.removeEventListener('finished', onFinished as never)
      greetAction?.stop()
      idleAction?.stop()
    }
  }, [actions, animations, mixer, reducedMotion, tracking])

  // --- Per-frame: pointer offset on top of the mixer output ----------------
  // Registered after `useAnimations`, so the mixer has already written the
  // animated pose by the time this runs. No React state is touched here.
  useFrame((frameState, delta) => {
    if (reducedMotion) return

    if (state.current === 'idle' || state.current === 'tracking') {
      weight.current = Math.min(1, weight.current + delta / TRACKING_RAMP)
      if (weight.current >= 1 && state.current === 'idle') setState('tracking')
    }

    const pointer = tracking.update(delta, frameState.clock.elapsedTime)
    applyTracking(parts.current, pointer, weight.current)
  })

  return (
    <group ref={group} position={position} scale={scale} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}
