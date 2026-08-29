import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide, MathUtils, type Group } from 'three'
import { applyTracking, createTrackedParts, type TrackedPart } from './applyTracking'
import { TRACKING_RAMP, type CharacterState } from './characterState'
import { useMouseTracking } from './useMouseTracking'

interface PlaceholderProps {
  scale?: number
  position?: [number, number, number]
  reducedMotion?: boolean
  theme?: 'light' | 'dark'
  onStateChange?: (state: CharacterState) => void
  /** Bump this to replay the greeting from the top. */
  greetKey?: number
}

/** Seconds the wave lasts before idle takes over. */
const GREETING_DURATION = 2.4
/** Arm rotation at rest — hanging below the frame. */
const ARM_REST = -0.28
/** Arm rotation at the top of the wave — hand up beside the head. */
const ARM_RAISED = 2.95

/**
 * Jason, built from primitives.
 *
 * This is the stand-in shown until `public/models/character.glb` exists: same
 * proportions, same palette and the same INITIALIZING → GREETING → IDLE →
 * TRACKING behaviour the real model will get, so swapping the GLB in changes
 * the look and nothing else.
 */
export function CharacterPlaceholder({
  scale = 1,
  position = [0, 0, 0],
  reducedMotion = false,
  theme = 'light',
  onStateChange,
  greetKey = 0,
}: PlaceholderProps) {
  const root = useRef<Group>(null)
  const torso = useRef<Group>(null)
  const neck = useRef<Group>(null)
  const head = useRef<Group>(null)
  const eyeL = useRef<Group>(null)
  const eyeR = useRef<Group>(null)
  const armWave = useRef<Group>(null)
  const browL = useRef<Group>(null)
  const browR = useRef<Group>(null)
  const lidL = useRef<Group>(null)
  const lidR = useRef<Group>(null)

  const tracking = useMouseTracking({ initiallyEnabled: false })
  const parts = useRef<TrackedPart[]>([])
  const state = useRef<CharacterState>('initializing')
  const weight = useRef(0)
  const stateTime = useRef(0)
  const nextBlink = useRef(1.6)
  const blinkTime = useRef(-1)

  const palette = useMemo(() => {
    const warm = theme === 'dark' ? 0.94 : 1
    return {
      skin: mix('#f2c6a0', warm),
      skinDeep: mix('#e0a87f', warm),
      hair: '#6d4326',
      hairDark: '#5a3620',
      beard: '#82522f',
      brow: '#5c3620',
      frame: '#3b2c26',
      sweater: theme === 'dark' ? '#d8d5cd' : '#eceae4',
      sweaterShade: theme === 'dark' ? '#c4c1b9' : '#dedbd4',
      eyeWhite: '#fbfbfb',
      iris: '#6b452a',
      pupil: '#1b1310',
      mouth: '#8d4f47',
      lip: '#c98a76',
    }
  }, [theme])

  const setState = (next: CharacterState) => {
    if (state.current === next) return
    state.current = next
    stateTime.current = 0
    onStateChange?.(next)
  }

  useEffect(() => {
    const eyes = [eyeL.current, eyeR.current].filter(
      (pivot): pivot is Group => pivot !== null,
    )
    parts.current = createTrackedParts(
      { head: head.current, neck: neck.current, torso: torso.current, eyes },
      new Set<string>(), // nothing here is driven by an animation mixer
    )

    // Reduced motion skips the wave and the idle float, but keeps the gaze:
    // it is small, user-driven, and stops the moment the pointer stops.
    if (reducedMotion) {
      tracking.enabled.current = true
      weight.current = 1
      setState('tracking')
      if (armWave.current) armWave.current.rotation.z = ARM_REST
      return
    }

    weight.current = 0
    tracking.enabled.current = false
    setState('greeting')
  }, [reducedMotion, tracking, greetKey])

  useFrame((frameState, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    const t = frameState.clock.elapsedTime
    stateTime.current += delta

    // --- Greeting: arm up, two beats of waving, then back down ------------
    if (state.current === 'greeting') {
      const p = Math.min(1, stateTime.current / GREETING_DURATION)
      // Rise quickly, hold, then drop — a smooth in-out envelope.
      const envelope = Math.sin(Math.min(1, p * 1.08) * Math.PI) ** 0.6
      const swing = Math.sin(stateTime.current * 9.2) * 0.38 * envelope

      if (armWave.current) {
        armWave.current.rotation.z =
          MathUtils.lerp(ARM_REST, ARM_RAISED, envelope) + swing
        armWave.current.rotation.x = envelope * 0.16
      }
      if (head.current) head.current.rotation.z = envelope * 0.1
      if (browL.current && browR.current) {
        browL.current.position.y = 0.225 + envelope * 0.024
        browR.current.position.y = 0.225 + envelope * 0.024
      }

      if (stateTime.current >= GREETING_DURATION) {
        tracking.enabled.current = true
        setState('idle')
      }
    } else if (!reducedMotion) {
      // Settle back to rest after the greeting.
      const k = 1 - Math.exp(-4.5 * delta)
      if (armWave.current) {
        armWave.current.rotation.z += (ARM_REST - armWave.current.rotation.z) * k
        armWave.current.rotation.x += (0 - armWave.current.rotation.x) * k
      }
      if (head.current) head.current.rotation.z += (0 - head.current.rotation.z) * k
      if (browL.current && browR.current) {
        browL.current.position.y += (0.225 - browL.current.position.y) * k
        browR.current.position.y += (0.225 - browR.current.position.y) * k
      }

      weight.current = Math.min(1, weight.current + delta / TRACKING_RAMP)
      if (weight.current >= 1 && state.current === 'idle') setState('tracking')
    }

    // --- Idle: a slow float and a breathing chest -------------------------
    if (!reducedMotion) {
      if (root.current) {
        root.current.position.y = position[1] + Math.sin(t * 0.85) * 0.035
        root.current.rotation.z = Math.sin(t * 0.55) * 0.011
      }
      if (torso.current) {
        torso.current.scale.set(1, 1 + Math.sin(t * 1.45) * 0.011, 1)
      }
    }

    // --- Blinking ---------------------------------------------------------
    if (!reducedMotion) {
      if (blinkTime.current < 0 && t > nextBlink.current) {
        blinkTime.current = 0
      }
      if (blinkTime.current >= 0) {
        blinkTime.current += delta
        const BLINK = 0.14
        const closed = Math.sin((blinkTime.current / BLINK) * Math.PI)
        const openY = Math.max(0.001, 1 - closed * 0.96)
        if (lidL.current) lidL.current.scale.y = openY
        if (lidR.current) lidR.current.scale.y = openY
        if (blinkTime.current >= BLINK) {
          blinkTime.current = -1
          nextBlink.current = t + 2.2 + Math.random() * 3.4
        }
      }
    }

    // --- Pointer offset on top of everything above ------------------------
    const pointer = tracking.update(delta, t)
    applyTracking(parts.current, pointer, weight.current)
  })

  const c = palette

  return (
    <group ref={root} position={position} scale={scale} dispose={null}>
      <group ref={torso}>
        {/* ---------------- Sweater ---------------- */}
        <mesh castShadow receiveShadow position={[0, -1.5, 0]}>
          <capsuleGeometry args={[0.62, 0.6, 10, 40]} />
          <meshStandardMaterial color={c.sweater} roughness={0.92} />
        </mesh>
        {/* Shoulders, widened so the bust reads as a person not a tube */}
        <mesh castShadow position={[0, -1.18, 0]} scale={[1.16, 0.58, 0.98]}>
          <sphereGeometry args={[0.58, 36, 28]} />
          <meshStandardMaterial color={c.sweater} roughness={0.92} />
        </mesh>
        {/* Crew neck collar */}
        <mesh position={[0, -0.82, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.062, 14, 44]} />
          <meshStandardMaterial color={c.sweaterShade} roughness={0.95} />
        </mesh>

        {/* ---------------- Arms ---------------- */}
        <group position={[-0.7, -1.18, 0.02]} rotation={[0, 0, 0.3]}>
          <mesh castShadow position={[0, -0.42, 0]}>
            <capsuleGeometry args={[0.16, 0.6, 8, 24]} />
            <meshStandardMaterial color={c.sweater} roughness={0.92} />
          </mesh>
        </group>

        <group ref={armWave} position={[0.48, -1.06, 0.1]} rotation={[0, 0, ARM_REST]}>
          {/* Sleeve */}
          <mesh castShadow position={[0, -0.37, 0]}>
            <capsuleGeometry args={[0.15, 0.5, 8, 24]} />
            <meshStandardMaterial color={c.sweater} roughness={0.92} />
          </mesh>
          {/* Wrist */}
          <mesh castShadow position={[0, -0.7, 0]}>
            <capsuleGeometry args={[0.1, 0.1, 6, 18]} />
            <meshStandardMaterial color={c.skin} roughness={0.62} />
          </mesh>
          {/* Hand */}
          <mesh castShadow position={[0, -0.86, 0]} scale={[1, 1.2, 0.62]}>
            <sphereGeometry args={[0.175, 28, 24]} />
            <meshStandardMaterial color={c.skin} roughness={0.62} />
          </mesh>
        </group>

        {/* ---------------- Neck ---------------- */}
        <group ref={neck} position={[0, -0.72, 0]}>
          <mesh castShadow position={[0, 0.2, -0.02]}>
            <cylinderGeometry args={[0.195, 0.24, 0.58, 24]} />
            <meshStandardMaterial color={c.skinDeep} roughness={0.66} />
          </mesh>

          {/* ---------------- Head ---------------- */}
          <group ref={head} position={[0, 0.78, 0]}>
            <mesh castShadow receiveShadow scale={[0.94, 1.04, 0.92]}>
              <sphereGeometry args={[0.52, 56, 56]} />
              <meshStandardMaterial color={c.skin} roughness={0.58} />
            </mesh>

            {/* Jaw — squares off the chin under the beard */}
            <mesh position={[0, -0.26, 0.02]} scale={[0.84, 0.6, 0.86]}>
              <sphereGeometry args={[0.46, 40, 36]} />
              <meshStandardMaterial color={c.skin} roughness={0.58} />
            </mesh>

            {/* Ears */}
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                castShadow
                position={[side * 0.545, -0.04, -0.01]}
                scale={[0.46, 1.05, 0.72]}
              >
                <sphereGeometry args={[0.125, 24, 24]} />
                <meshStandardMaterial color={c.skinDeep} roughness={0.62} />
              </mesh>
            ))}

            {/* Nose */}
            <mesh position={[0, -0.035, 0.5]} scale={[0.78, 1, 0.95]}>
              <sphereGeometry args={[0.088, 24, 24]} />
              <meshStandardMaterial color={c.skin} roughness={0.56} />
            </mesh>

            {/* ---------------- Beard ---------------- */}
            {/* A thin shell hugging the jaw, cheeks and chin. */}
            <mesh position={[0, 0, 0]} rotation={[0.34, 0, 0]} scale={[1, 1.05, 1]}>
              <sphereGeometry
                args={[0.545, 56, 44, Math.PI / 2 - 1.36, 2.72, 1.76, 1.02]}
              />
              <meshStandardMaterial
                color={c.beard}
                roughness={0.95}
                side={DoubleSide}
              />
            </mesh>

            {/* Moustache */}
            <mesh position={[0, -0.16, 0.475]} scale={[1.55, 0.46, 0.62]}>
              <sphereGeometry args={[0.115, 28, 22]} />
              <meshStandardMaterial color={c.beard} roughness={0.95} />
            </mesh>

            {/* Mouth — a small warm smile between moustache and beard */}
            <mesh position={[0, -0.248, 0.48]} rotation={[0.16, 0, 0]} scale={[1.3, 0.3, 0.34]}>
              <sphereGeometry args={[0.088, 26, 20]} />
              <meshStandardMaterial color={c.mouth} roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.229, 0.492]} scale={[1.2, 0.16, 0.28]}>
              <sphereGeometry args={[0.088, 24, 18]} />
              <meshStandardMaterial color={c.lip} roughness={0.5} />
            </mesh>

            {/* ---------------- Eyes ---------------- */}
            {([-1, 1] as const).map((side) => {
              const pivot = side === -1 ? eyeL : eyeR
              const lid = side === -1 ? lidL : lidR
              return (
                <group key={side} position={[0, 0.055, 0]}>
                  <group ref={lid} position={[side * 0.175, 0, 0]}>
                    {/* Sclera */}
                    <mesh position={[0, 0, 0.44]} scale={[1, 0.96, 0.72]}>
                      <sphereGeometry args={[0.1, 30, 26]} />
                      <meshStandardMaterial color={c.eyeWhite} roughness={0.24} />
                    </mesh>
                    {/* Iris + pupil orbit the eyeball, so the gaze actually moves */}
                    <group ref={pivot} position={[0, 0, 0.44]}>
                      <mesh position={[0, 0, 0.072]} scale={[1, 1, 0.55]}>
                        <sphereGeometry args={[0.052, 26, 22]} />
                        <meshStandardMaterial color={c.iris} roughness={0.2} />
                      </mesh>
                      <mesh position={[0, 0, 0.094]} scale={[1, 1, 0.5]}>
                        <sphereGeometry args={[0.028, 20, 16]} />
                        <meshStandardMaterial color={c.pupil} roughness={0.15} />
                      </mesh>
                    </group>
                  </group>
                </group>
              )
            })}

            {/* Eyebrows */}
            {([-1, 1] as const).map((side) => (
              <group
                key={side}
                ref={side === -1 ? browL : browR}
                position={[side * 0.178, 0.225, 0]}
              >
                <mesh
                  position={[0, 0, 0.44]}
                  rotation={[0.12, 0, side * -0.16]}
                  scale={[1.7, 0.32, 0.4]}
                >
                  <sphereGeometry args={[0.085, 24, 18]} />
                  <meshStandardMaterial color={c.brow} roughness={0.9} />
                </mesh>
              </group>
            ))}

            {/* ---------------- Glasses ---------------- */}
            <group position={[0, 0.045, 0]}>
              {[-1, 1].map((side) => (
                <mesh
                  key={side}
                  position={[side * 0.183, 0, 0.51]}
                  rotation={[0, side * -0.16, 0]}
                >
                  <torusGeometry args={[0.15, 0.021, 14, 40]} />
                  <meshStandardMaterial
                    color={c.frame}
                    roughness={0.32}
                    metalness={0.12}
                  />
                </mesh>
              ))}
              {/* Bridge */}
              <mesh position={[0, 0.016, 0.53]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.016, 0.062, 6, 14]} />
                <meshStandardMaterial color={c.frame} roughness={0.32} metalness={0.12} />
              </mesh>
              {/* Temples running back to the ears */}
              {[-1, 1].map((side) => (
                <mesh
                  key={side}
                  position={[side * 0.42, 0.01, 0.28]}
                  rotation={[0, side * 0.95, Math.PI / 2]}
                >
                  <capsuleGeometry args={[0.014, 0.42, 6, 12]} />
                  <meshStandardMaterial color={c.frame} roughness={0.32} metalness={0.12} />
                </mesh>
              ))}
            </group>

            {/* ---------------- Hair ---------------- */}
            {/* Cap over the skull */}
            <mesh position={[0, 0.015, -0.02]} rotation={[-0.3, 0, 0]} scale={[1, 1.03, 1.04]}>
              <sphereGeometry args={[0.55, 56, 44, 0, Math.PI * 2, 0, 1.34]} />
              <meshStandardMaterial color={c.hair} roughness={0.72} side={DoubleSide} />
            </mesh>
            {/* Quiff — lifted off the forehead and swept back to one side */}
            <mesh
              position={[0.05, 0.42, 0.05]}
              rotation={[-0.5, 0.24, -0.16]}
              scale={[1.08, 0.56, 0.9]}
            >
              <sphereGeometry args={[0.44, 40, 32]} />
              <meshStandardMaterial color={c.hair} roughness={0.72} />
            </mesh>
            {/* Volume at the back of the crown */}
            <mesh position={[-0.02, 0.2, -0.16]} scale={[1, 0.92, 0.86]}>
              <sphereGeometry args={[0.46, 40, 32]} />
              <meshStandardMaterial color={c.hairDark} roughness={0.75} />
            </mesh>
            {/* Sideburns tying the hair into the beard */}
            {[-1, 1].map((side) => (
              <mesh
                key={side}
                position={[side * 0.455, 0.02, 0.02]}
                scale={[0.4, 1.3, 0.8]}
              >
                <sphereGeometry args={[0.14, 24, 20]} />
                <meshStandardMaterial color={c.hairDark} roughness={0.8} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  )
}

/** Nudges a hex colour towards or away from white by `k` (1 = unchanged). */
function mix(hex: string, k: number): string {
  if (k === 1) return hex
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(v * k))),
  )
  return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
