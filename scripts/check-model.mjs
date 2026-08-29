#!/usr/bin/env node
/**
 * Checks a character GLB against what the hero expects, without opening a
 * browser or installing anything.
 *
 *   npm run check:model                      # checks public/models/character.glb
 *   npm run check:model -- path/to/other.glb
 *
 * A GLB is a small binary container whose first chunk is the glTF JSON — node
 * names, animation names, skins. That is everything needed to answer the only
 * two questions that matter: will the greeting play, and will the tracking find
 * a head? Reading it directly keeps this dependency-free.
 */
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

// Kept deliberately in step with src/components/Character/bones.ts.
const BONE_CANDIDATES = {
  head: ['head', 'kopf', 'cabeza', 'head_01', 'headtop', 'def-head'],
  neck: ['neck', 'nacken', 'hals', 'cuello', 'neck_01', 'neck1', 'def-neck'],
  torso: ['spine', 'spine1', 'spine2', 'chest', 'upperchest', 'torso', 'body'],
  eyeLeft: ['lefteye', 'eye_l', 'eyel', 'eye.l', 'ojo_l', 'eye_left', 'auge_l'],
  eyeRight: ['righteye', 'eye_r', 'eyer', 'eye.r', 'ojo_r', 'eye_right', 'auge_r'],
  eyes: ['eyes', 'eye', 'ojos', 'augen'],
}
const GREETING_PATTERN = /greet|wav|hello|hallo|winke|salud|hi\b/i
const IDLE_PATTERN = /idle|breath|stand|loop/i

const norm = (name) =>
  name.toLowerCase().replace(/^mixamorig[:_]?/, '').replace(/[\s._-]/g, '')

function findBone(names, candidates) {
  const wanted = candidates.map(norm)
  const exact = names.find((n) => wanted.includes(norm(n)))
  if (exact) return exact
  return names.find((n) => wanted.some((c) => norm(n).includes(c))) ?? null
}

function readGlbJson(buffer) {
  if (buffer.length < 12) throw new Error('File is too short to be a GLB.')
  if (buffer.readUInt32LE(0) !== 0x46546c67) {
    throw new Error(
      'Not a binary GLB. Export as .glb (glTF Binary), not .gltf or .fbx.',
    )
  }
  let offset = 12
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset)
    const type = buffer.readUInt32LE(offset + 4)
    const start = offset + 8
    if (type === 0x4e4f534a) {
      return JSON.parse(buffer.subarray(start, start + length).toString('utf8'))
    }
    offset = start + length
  }
  throw new Error('No JSON chunk found — the file looks corrupt.')
}

const bold = (s) => `\x1b[1m${s}\x1b[0m`
const green = (s) => `\x1b[32m${s}\x1b[0m`
const yellow = (s) => `\x1b[33m${s}\x1b[0m`
const red = (s) => `\x1b[31m${s}\x1b[0m`
const dim = (s) => `\x1b[2m${s}\x1b[0m`
const OK = green('  ok  ')
const WARN = yellow(' note ')
const FAIL = red(' fail ')

const target = resolve(process.argv[2] ?? 'public/models/character.glb')

let buffer
try {
  buffer = readFileSync(target)
} catch {
  console.error(`\n${FAIL} No file at ${bold(target)}`)
  console.error(dim('\n       Export your model there, then run this again.'))
  console.error(dim('       See docs/CHARACTER-MODEL.md for how to make one.\n'))
  process.exit(1)
}

let gltf
try {
  gltf = readGlbJson(buffer)
} catch (error) {
  console.error(`\n${FAIL} ${error.message}\n`)
  process.exit(1)
}

const nodeNames = (gltf.nodes ?? []).map((n) => n.name).filter(Boolean)
const clipNames = (gltf.animations ?? []).map((a) => a.name).filter(Boolean)
const megabytes = statSync(target).size / 1024 / 1024

console.log(`\n${bold('Character model check')}  ${dim(target)}\n`)

/* ---------------------------------------------------------------- size --- */
const sizeLine = `${megabytes.toFixed(1)} MB`
if (megabytes <= 6) console.log(`${OK}  size ${sizeLine}`)
else if (megabytes <= 15)
  console.log(
    `${WARN}  size ${sizeLine} ${dim('— heavy for a first paint; consider compressing textures')}`,
  )
else
  console.log(
    `${FAIL}  size ${sizeLine} ${dim('— too heavy; reduce texture resolution or run gltf-transform')}`,
  )

/* ----------------------------------------------------------- animation --- */
const greeting = clipNames.find((n) => GREETING_PATTERN.test(n))
const idle = clipNames.find((n) => IDLE_PATTERN.test(n))

if (clipNames.length === 0) {
  console.log(
    `${WARN}  no animations ${dim('— the character will stand still but still track the pointer')}`,
  )
} else {
  console.log(`${dim('       clips:')} ${clipNames.join(', ')}`)
  console.log(
    greeting
      ? `${OK}  greeting clip: ${bold(greeting)}`
      : `${WARN}  no greeting clip ${dim('— rename one to "Greeting" or "Wave"')}`,
  )
  console.log(
    idle
      ? `${OK}  idle clip: ${bold(idle)}`
      : `${WARN}  no idle clip ${dim('— rename one to "Idle"')}`,
  )
}

/* ---------------------------------------------------------------- bones --- */
const head = findBone(nodeNames, BONE_CANDIDATES.head)
const neck = findBone(nodeNames, BONE_CANDIDATES.neck)
const torso = findBone(nodeNames, BONE_CANDIDATES.torso)
const eyeL = findBone(nodeNames, BONE_CANDIDATES.eyeLeft)
const eyeR = findBone(nodeNames, BONE_CANDIDATES.eyeRight)
const eyesGrouped = eyeL || eyeR ? null : findBone(nodeNames, BONE_CANDIDATES.eyes)

console.log('')
console.log(
  head
    ? `${OK}  head bone: ${bold(head)} ${dim('(also drives automatic framing)')}`
    : `${FAIL}  no head bone ${dim('— tracking will not work; add the name to bones.ts')}`,
)
console.log(
  neck ? `${OK}  neck bone: ${bold(neck)}` : `${WARN}  no neck bone ${dim('— that layer is skipped')}`,
)
console.log(
  torso ? `${OK}  torso bone: ${bold(torso)}` : `${WARN}  no torso bone ${dim('— that layer is skipped')}`,
)
if (eyeL || eyeR) {
  console.log(`${OK}  eye bones: ${bold([eyeL, eyeR].filter(Boolean).join(', '))}`)
} else if (eyesGrouped) {
  console.log(`${OK}  eye node: ${bold(eyesGrouped)}`)
} else {
  console.log(
    `${WARN}  no eye bones ${dim('— head and neck still track; the gaze just moves less')}`,
  )
}

/* -------------------------------------------------------------- verdict --- */
console.log('')
if (!head) {
  console.log(red('Not usable yet.'), 'The rig has no bone this project recognises as a head.')
  console.log(dim(`Node names found: ${nodeNames.slice(0, 12).join(', ')}${nodeNames.length > 12 ? ', …' : ''}`))
  console.log(dim('Add the right name to BONE_CANDIDATES in src/components/Character/bones.ts.\n'))
  process.exit(1)
}

console.log(green('Good to go.'), 'Drop it at public/models/character.glb and reload — it is picked up automatically.')
if (!greeting || !idle) {
  console.log(dim('Rename the actions in Blender before exporting to get the full greeting → idle sequence.'))
}
console.log('')
