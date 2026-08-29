import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Box3, LoopOnce, Vector3 } from 'three'
import type { AnimationAction, Group, Object3D } from 'three'
import { applyTracking, createTrackedParts, type TrackedPart } from './applyTracking'
import {
  collectAnimatedNodes,
  findClip,
  GREETING_PATTERN,
  IDLE_PATTERN,
  resolveBones,
} from './bones'
import { FRAMING } from './characterConfig'
import { TRACKING_RAMP, type CharacterState } from './characterState'
import { useMouseTracking } from './useMouseTracking'

interface CharacterProps {
  url: string
  /** Multiplies the automatically computed scale. 1 = leave the framing alone. */
  scale?: number
  /** Nudge applied after automatic framing, in world units. */
  position?: [number, number, number]
  /** When true the greeting and pointer tracking are skipped entirely. */
  reducedMotion?: boolean
  onStateChange?: (state: CharacterState) => void
}

/**
 * Measures the model and fits it to the hero's framing.
 *
 * Avatars arrive at every imaginable scale, so hardcoding one would make
 * "drop your GLB in" a lie. When the rig has a head bone the model is cropped to
 * a head-and-shoulders bust around it; otherwise the whole bounding box is
 * fitted. Targets live in `characterConfig.ts`.
 */
function computeFraming(scene: Object3D, head: Object3D | null) {
  scene.updateWorldMatrix(true, true)
  const box = new Box3().setFromObject(scene)
  if (box.isEmpty()) return { scale: 1, offset: [0, 0, 0] as const }

  if (head) {
    const headPos = head.getWorldPosition(new Vector3())
    // Everything above the head bone is roughly the top half of the skull.
    const headSpan = Math.max(0.02, (box.max.y - headPos.y) * 2)
    const scale = FRAMING.headDiameter / headSpan
    return {
      scale,
      offset: [
        -headPos.x * scale,
        FRAMING.headY - headPos.y * scale,
        -headPos.z * scale,
      ] as const,
    }
  }

  const size = box.getSize(new Vector3())
  const center = box.getCenter(new Vector3())
  const scale = FRAMING.fullHeight / Math.max(0.02, size.y)
  return {
    scale,
    offset: [-center.x * scale, -center.y * scale, -center.z * scale] as const,
  }
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

  const bones = useMemo(() => resolveBones(scene), [scene])
  const framing = useMemo(() => computeFraming(scene, bones.head), [scene, bones])

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
    parts.current = createTrackedParts(bones, collectAnimatedNodes(animations))

    if (import.meta.env.DEV) {
      const found = Object.entries({
        head: bones.head?.name,
        neck: bones.neck?.name,
        torso: bones.torso?.name,
        eyes: bones.eyes.map((eye) => eye.name).join(', ') || undefined,
      })
        .filter(([, value]) => value)
        .map(([key, value]) => `${key}=${value}`)
      console.info(
        `[character] clips: ${animations.map((clip) => clip.name).join(', ') || 'none'}`,
        `\n[character] bones: ${found.join('  ') || 'none matched — see bones.ts'}`,
        `\n[character] auto-scale: ${framing.scale.toFixed(3)}`,
      )
    }
  }, [scene, animations, bones, framing])

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

  // Outer group carries the manual nudge, inner group the measured framing, so
  // the two never have to be reconciled by hand.
  return (
    <group position={position} scale={scale} dispose={null}>
      <group ref={group} position={framing.offset} scale={framing.scale}>
        <primitive object={scene} />
      </group>
    </group>
  )
}
