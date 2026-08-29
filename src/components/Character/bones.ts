import type { AnimationClip, Object3D } from 'three'

/**
 * Bone discovery.
 *
 * Every rig names things differently, so the character looks for a list of
 * candidates instead of a fixed skeleton. Nothing here is required: a rig
 * without an explicit neck simply skips that level of motion.
 *
 * ---------------------------------------------------------------------------
 * To support a differently named rig, add the name to the arrays below.
 * Matching is case-insensitive and ignores `mixamorig:`-style prefixes.
 * ---------------------------------------------------------------------------
 */
export const BONE_CANDIDATES = {
  head: ['head', 'kopf', 'cabeza', 'head_01', 'headtop', 'def-head'],
  neck: ['neck', 'nacken', 'hals', 'cuello', 'neck_01', 'neck1', 'def-neck'],
  torso: ['spine', 'spine1', 'spine2', 'chest', 'upperchest', 'torso', 'body'],
  eyeLeft: ['lefteye', 'eye_l', 'eyel', 'eye.l', 'ojo_l', 'eye_left', 'auge_l'],
  eyeRight: [
    'righteye',
    'eye_r',
    'eyer',
    'eye.r',
    'ojo_r',
    'eye_right',
    'auge_r',
  ],
  /** Rigs where both eyes sit under one node. */
  eyes: ['eyes', 'eye', 'ojos', 'augen'],
} as const

export interface CharacterBones {
  head: Object3D | null
  neck: Object3D | null
  torso: Object3D | null
  eyes: Object3D[]
}

function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/^mixamorig[:_]?/, '')
    .replace(/[\s._-]/g, '')
}

function findByCandidates(
  root: Object3D,
  candidates: readonly string[],
): Object3D | null {
  const wanted = candidates.map(normalise)
  let exact: Object3D | null = null
  let partial: Object3D | null = null

  root.traverse((node) => {
    if (exact) return
    const name = normalise(node.name)
    if (!name) return
    if (wanted.includes(name)) {
      exact = node
      return
    }
    if (!partial && wanted.some((candidate) => name.includes(candidate))) {
      partial = node
    }
  })

  return exact ?? partial
}

export function resolveBones(root: Object3D): CharacterBones {
  const head = findByCandidates(root, BONE_CANDIDATES.head)
  const neck = findByCandidates(root, BONE_CANDIDATES.neck)
  const torso = findByCandidates(root, BONE_CANDIDATES.torso)

  const eyes: Object3D[] = []
  const left = findByCandidates(root, BONE_CANDIDATES.eyeLeft)
  const right = findByCandidates(root, BONE_CANDIDATES.eyeRight)
  if (left) eyes.push(left)
  if (right) eyes.push(right)
  if (eyes.length === 0) {
    const grouped = findByCandidates(root, BONE_CANDIDATES.eyes)
    if (grouped) eyes.push(grouped)
  }

  return { head, neck, torso, eyes }
}

/**
 * Names of the nodes an animation clip actually drives. Bones in this set have
 * their rotation rewritten by the mixer every frame, so pointer offsets are
 * composed on top of the current pose; bones outside it are composed on top of
 * their rest pose instead (otherwise the offset would accumulate).
 */
export function collectAnimatedNodes(clips: AnimationClip[]): Set<string> {
  const names = new Set<string>()
  for (const clip of clips) {
    for (const track of clip.tracks) {
      const nodeName = track.name.split('.')[0]
      if (nodeName) names.add(nodeName)
    }
  }
  return names
}

/** Clip lookup by intent, so no clip-name convention is hardcoded. */
export function findClip(
  clips: AnimationClip[],
  pattern: RegExp,
): AnimationClip | null {
  return clips.find((clip) => pattern.test(clip.name)) ?? null
}

export const GREETING_PATTERN = /greet|wav|hello|hallo|winke|salud|hi\b/i
export const IDLE_PATTERN = /idle|breath|stand|loop/i
