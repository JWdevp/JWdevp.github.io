import { Euler, Quaternion, type Object3D } from 'three'
import type { CharacterBones } from './bones'
import { TRACKING_LIMITS, VERTICAL_SCALE, type Vec2 } from './useMouseTracking'

/**
 * Composes the pointer offset on top of whatever the animation mixer produced.
 *
 * Rotation is layered per body part with decreasing amplitude — eyes, head,
 * neck, torso — which is what makes the motion read as a person looking at
 * something rather than a prop being rotated.
 */

export interface TrackedPart {
  object: Object3D
  /** Rest pose, used for bones no clip touches. */
  rest: Quaternion
  /** Bones the mixer rewrites each frame compose on top of the live pose. */
  animated: boolean
  maxYaw: number
  maxPitch: number
  /** Eyes react faster than the body they sit in. */
  responsiveness: number
}

const offsetEuler = new Euler(0, 0, 0, 'YXZ')
const offsetQuat = new Quaternion()
const composed = new Quaternion()

export function createTrackedParts(
  bones: CharacterBones,
  animatedNodes: Set<string>,
  limits = TRACKING_LIMITS,
): TrackedPart[] {
  const parts: TrackedPart[] = []

  const push = (
    object: Object3D | null,
    maxYaw: number,
    responsiveness = 1,
  ) => {
    if (!object) return
    parts.push({
      object,
      rest: object.quaternion.clone(),
      animated: animatedNodes.has(object.name),
      maxYaw,
      maxPitch: maxYaw * VERTICAL_SCALE,
      responsiveness,
    })
  }

  push(bones.torso, limits.MAX_TORSO_ROTATION, 0.7)
  push(bones.neck, limits.MAX_NECK_ROTATION, 0.85)
  push(bones.head, limits.MAX_HEAD_ROTATION, 1)
  for (const eye of bones.eyes) push(eye, limits.MAX_EYE_ROTATION, 1.15)

  return parts
}

/**
 * @param pointer damped pointer in -1…1
 * @param weight  0 disables the offset entirely (used while greeting)
 */
export function applyTracking(
  parts: TrackedPart[],
  pointer: Vec2,
  weight = 1,
): void {
  if (parts.length === 0) return

  for (const part of parts) {
    const factor = weight * part.responsiveness
    // Yaw follows the cursor horizontally; pitch is inverted because screen Y
    // grows downwards while a head tilting up is a negative X rotation.
    const yaw = clamp(pointer.x * part.maxYaw * factor, -part.maxYaw, part.maxYaw)
    const pitch = clamp(
      -pointer.y * part.maxPitch * factor,
      -part.maxPitch,
      part.maxPitch,
    )

    offsetEuler.set(pitch, yaw, 0)
    offsetQuat.setFromEuler(offsetEuler)

    const base = part.animated ? part.object.quaternion : part.rest
    composed.copy(base).multiply(offsetQuat)
    part.object.quaternion.copy(composed)
  }
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value
}
