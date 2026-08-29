import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { applyTracking, createTrackedParts, type TrackedPart } from './applyTracking'
import { TRACKING_RAMP, type CharacterState } from './characterState'
import { useMouseTracking } from './useMouseTracking'

interface PlaceholderProps {
  scale?: number
  position?: [number, number, number]
  reducedMotion?: boolean
  theme?: 'light' | 'dark'
  onStateChange?: (state: CharacterState) => void
}

const GREETING_DURATION = 2.1

/**
 * Stand-in character used until `public/models/character.glb` exists.
 *
 * It is not a "missing asset" box: it is a deliberately abstract figure built
 * from primitives that runs the same INITIALIZING → GREETING → IDLE → TRACKING
 * machine, waves with its arm, and tracks the pointer through the same
 * head/neck/torso/eye hierarchy — so swapping in the real model changes the
 * look, not the behaviour.
 */
export function CharacterPlaceholder({
  scale = 1,
  position = [0, 0, 0],
  reducedMotion = false,
  theme = 'light',
  onStateChange,
}: PlaceholderProps) {
  const root = useRef<Group>(null)
  const torso = useRef<Group>(null)
  const neck = useRef<Group>(null)
  const head = useRef<Group>(null)
  // Eyes pivot around the centre of the head rather than spinning in place,
  // so the pupils actually travel across the face.
  const eyeL = useRef<Group>(null)
  const eyeR = useRef<Group>(null)
  const armWave = useRef<Group>(null)

  const tracking = useMouseTracking({ initiallyEnabled: false })
  const parts = useRef<TrackedPart[]>([])
  const state = useRef<CharacterState>('initializing')
  const weight = useRef(0)
  const elapsedInState = useRef(0)

  const colors = useMemo(
    () =>
      theme === 'dark'
        ? { body: '#2b2f3d', eye: '#e9ecf5' }
        : { body: '#e7e8ec', eye: '#15161d' },
    [theme],
  )

  const setState = (next: CharacterState) => {
    if (state.current === next) return
    state.current = next
    elapsedInState.current = 0
    onStateChange?.(next)
  }

  useEffect(() => {
    const eyes = [eyeL.current, eyeR.current].filter(
      (pivot): pivot is Group => pivot !== null,
    )
    parts.current = createTrackedParts(
      {
        head: head.current,
        neck: neck.current,
        torso: torso.current,
        eyes,
      },
      new Set<string>(), // nothing here is mixer-driven
    )

    if (reducedMotion) {
      setState('idle')
      return
    }
    setState('greeting')
  }, [reducedMotion])

  useFrame((frameState, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const t = frameState.clock.elapsedTime
    elapsedInState.current += delta

    if (reducedMotion) {
      if (armWave.current) armWave.current.rotation.z = -0.35
      return
    }

    // --- Greeting: a two-beat wave, then hand over to idle -----------------
    if (state.current === 'greeting') {
      const progress = Math.min(1, elapsedInState.current / GREETING_DURATION)
      const lift = Math.sin(Math.min(progress, 1) * Math.PI) // up and back down
      const swing = Math.sin(elapsedInState.current * 8.5) * 0.42 * lift
      if (armWave.current) {
        armWave.current.rotation.z = -0.35 - lift * 1.85 + swing
        armWave.current.rotation.x = -lift * 0.25
      }
      if (head.current) head.current.rotation.z = lift * 0.11
      if (elapsedInState.current >= GREETING_DURATION) {
        tracking.enabled.current = true
        setState('idle')
      }
    } else {
      // Relax the arm back down after the greeting.
      if (armWave.current) {
        armWave.current.rotation.z +=
          (-0.35 - armWave.current.rotation.z) * (1 - Math.exp(-4 * delta))
        armWave.current.rotation.x +=
          (0 - armWave.current.rotation.x) * (1 - Math.exp(-4 * delta))
      }
      if (head.current) {
        head.current.rotation.z += (0 - head.current.rotation.z) * (1 - Math.exp(-4 * delta))
      }

      weight.current = Math.min(1, weight.current + delta / TRACKING_RAMP)
      if (weight.current >= 1 && state.current === 'idle') setState('tracking')
    }

    // --- Idle: breathing and a slow float ---------------------------------
    if (root.current) {
      root.current.position.y = position[1] + Math.sin(t * 0.9) * 0.045
      root.current.rotation.z = Math.sin(t * 0.6) * 0.012
    }
    if (torso.current) {
      const breath = 1 + Math.sin(t * 1.5) * 0.014
      torso.current.scale.set(1, breath, 1)
    }

    const pointer = tracking.update(delta, t)
    applyTracking(parts.current, pointer, weight.current)
  })

  return (
    <group ref={root} position={position} scale={scale} dispose={null}>
      <group ref={torso}>
        {/* Body */}
        <mesh castShadow receiveShadow position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.42, 0.62, 8, 32]} />
          <meshStandardMaterial
            color={colors.body}
            roughness={0.42}
            metalness={0.04}
          />
        </mesh>

        {/* Static arm */}
        <group position={[-0.46, 0.12, 0]} rotation={[0, 0, 0.35]}>
          <mesh castShadow position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.115, 0.44, 6, 20]} />
            <meshStandardMaterial color={colors.body} roughness={0.45} />
          </mesh>
        </group>

        {/* Waving arm */}
        <group ref={armWave} position={[0.46, 0.12, 0]} rotation={[0, 0, -0.35]}>
          <mesh castShadow position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.115, 0.44, 6, 20]} />
            <meshStandardMaterial color={colors.body} roughness={0.45} />
          </mesh>
          <mesh castShadow position={[0, -0.58, 0]}>
            <sphereGeometry args={[0.135, 24, 24]} />
            <meshStandardMaterial color={colors.body} roughness={0.4} />
          </mesh>
        </group>

        {/* Neck */}
        <group ref={neck} position={[0, 0.52, 0]}>
          <mesh castShadow position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.13, 0.17, 0.2, 20]} />
            <meshStandardMaterial color={colors.body} roughness={0.5} />
          </mesh>

          {/* Head */}
          <group ref={head} position={[0, 0.28, 0]}>
            <mesh castShadow receiveShadow scale={[1, 1.06, 0.98]}>
              <sphereGeometry args={[0.34, 48, 48]} />
              <meshStandardMaterial
                color={colors.body}
                roughness={0.36}
                metalness={0.03}
              />
            </mesh>

            <group ref={eyeL} position={[0, 0.045, 0]}>
              <mesh position={[-0.115, 0, 0.302]}>
                <sphereGeometry args={[0.052, 24, 24]} />
                <meshStandardMaterial
                  color={colors.eye}
                  roughness={0.18}
                  metalness={0.15}
                />
              </mesh>
            </group>
            <group ref={eyeR} position={[0, 0.045, 0]}>
              <mesh position={[0.115, 0, 0.302]}>
                <sphereGeometry args={[0.052, 24, 24]} />
                <meshStandardMaterial
                  color={colors.eye}
                  roughness={0.18}
                  metalness={0.15}
                />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
