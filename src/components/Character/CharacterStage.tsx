import { useCallback, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { FOLLOW, LAYOUT, MAX_TRAVEL } from './characterConfig'
import manifest from './manifest.json'
import { useGazeTracking, type Gaze } from './useGazeTracking'
import './character.css'

const SHEET = `${import.meta.env.BASE_URL}character/${manifest.sprite}`
const STILL = `${import.meta.env.BASE_URL}character/${manifest.still}`
/** Touch devices get a wave instead of tracking. Not built by the pipeline —
 *  drop the file in and it is used; if it is not there, the still is. */
const WAVE = `${import.meta.env.BASE_URL}character/wave.mp4`

/** Gaze of every frame, flattened — read once per animation frame, so the pair
 *  of numbers should be adjacent in memory rather than behind two lookups. */
const GAZE = Float32Array.from(manifest.gaze.flat())
const COUNT = manifest.count
const WEIGHT_X = manifest.gazeWeightX

/** Whether this device has a pointer that can be followed at all. Read once:
 *  a machine does not grow a mouse mid-session, and if one is plugged in the
 *  page it changes is the next one. */
function hasFinePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
}

/**
 * The hero character.
 *
 * The sheet is the clip in order, not a set of poses, and that is the whole
 * design: the cursor chooses a *position in the clip*, and this walks there one
 * frame at a time. Every step is therefore two frames that were filmed next to
 * each other, so what plays is recorded movement — the head turning, not a cut
 * from one picture to another.
 *
 * An earlier version kept 36 poses chosen for how different they looked and
 * jumped straight to the best match. Adjacent frames of the clip differ by
 * about 1.6/255; poses picked that way differ by about 10, and that difference
 * is exactly what read as a slideshow.
 *
 * Nothing here crossfades. Two frames are never mixed, so there is no ghosting
 * — the smoothness comes from the steps being small, not from blending.
 *
 * The character itself never moves, scales or rotates; only the frame changes,
 * as a `translate3d` the compositor handles without repainting. React does not
 * re-render while the cursor moves.
 */
export function CharacterStage() {
  const { t } = useLanguage()
  const stage = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLImageElement>(null)
  /** Position in the clip. Continuous, so it can be eased; the frame shown is
   *  this rounded. */
  const position = useRef(manifest.neutral)
  const shown = useRef(-1)
  const [ready, setReady] = useState(false)
  const [wavePlaying, setWavePlaying] = useState(false)
  const [waveBroken, setWaveBroken] = useState(false)
  const tracks = useMemo(hasFinePointer, [])

  const render = useCallback(
    (gaze: Gaze, delta: number) => {
      const img = sheet.current
      if (!img) return

      // Aim: the frame that looks closest to where the cursor is. No tie-break
      // for nearness is needed — every frame here belongs to one pass of the
      // recording, so the nearest match is never on the far side of the clip.
      const here = position.current
      let aim = 0
      let bestCost = Infinity
      for (let i = 0; i < COUNT; i += 1) {
        const dx = GAZE[i * 2] - gaze.x
        const dy = GAZE[i * 2 + 1] - gaze.y
        const cost = WEIGHT_X * dx * dx + dy * dy
        if (cost < bestCost) {
          bestCost = cost
          aim = i
        }
      }

      // Ease towards it, but never faster than MAX_TRAVEL frames a second.
      // The cap is what guarantees the walk passes through the frames in
      // between instead of skipping over them.
      const limit = MAX_TRAVEL * delta
      let step = (aim - here) * (1 - Math.exp(-FOLLOW * delta))
      if (step > limit) step = limit
      else if (step < -limit) step = -limit
      position.current = here + step

      const frame = Math.round(position.current)
      if (frame === shown.current) return
      shown.current = frame

      const x = (frame % manifest.columns) / manifest.columns
      const y = Math.floor(frame / manifest.columns) / manifest.rows
      img.style.transform = `translate3d(${-x * 100}%, ${-y * 100}%, 0)`
    },
    [],
  )

  useGazeTracking(stage, tracks ? render : noop)

  // Without a cursor there is nothing to follow, so the sheet is never fetched
  // — which is also what keeps a megabyte off a phone's budget. A single frame
  // is shown instead, with a wave played once over the top of it.
  //
  // The frame is the layer that counts: it decides the element's size and marks
  // the character ready. The video sits on top and is pure addition, so a
  // missing or unplayable wave.mp4 costs nothing but the wave.
  const src = tracks ? SHEET : STILL
  const neutral = manifest.neutral
  const wave = !tracks && !waveBroken

  return (
    <div
      className="character"
      ref={stage}
      style={{
        // Every size and offset comes from characterConfig.
        width: LAYOUT.width,
        maxWidth: LAYOUT.maxWidth,
        aspectRatio: `${manifest.frameWidth} / ${manifest.frameHeight}`,
        translate: `${LAYOUT.offsetX} ${LAYOUT.offsetY}`,
        ['--character-cols' as string]: tracks ? manifest.columns : 1,
        ['--character-rows' as string]: tracks ? manifest.rows : 1,
        ['--character-mobile-max' as string]: LAYOUT.mobileMaxWidth,
      }}
      data-ready={ready || undefined}
    >
      <img
        className="character__sheet"
        ref={sheet}
        src={src}
        alt=""
        draggable={false}
        decoding="async"
        style={
          tracks
            ? {
                // Start on the resting frame, so the first paint is not the
                // top-left corner of the sheet.
                transform: `translate3d(${
                  -((neutral % manifest.columns) / manifest.columns) * 100
                }%, ${-(Math.floor(neutral / manifest.columns) / manifest.rows) * 100}%, 0)`,
              }
            : undefined
        }
        onLoad={() => setReady(true)}
      />
      {wave ? (
        <video
          className="character__wave"
          src={WAVE}
          // Plays through once and holds on its last frame — no `loop`. Muted
          // and inline are what let a phone start it without a tap.
          autoPlay
          muted
          playsInline
          preload="auto"
          // Hidden until it can actually play. A missing file does not reliably
          // raise `error` on a media element, and an empty <video> paints as a
          // black box in some browsers — this way it simply never appears.
          data-playing={wavePlaying || undefined}
          onCanPlay={() => setWavePlaying(true)}
          onError={() => setWaveBroken(true)}
        />
      ) : null}
      <p className="visually-hidden">{t.a11y.character}</p>
    </div>
  )
}

function noop() {}
