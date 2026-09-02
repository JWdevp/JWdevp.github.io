import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const [waveSettled, setWaveSettled] = useState(false)

  /**
   * Reveal the wave once it has a frame to show.
   *
   * Not an `onCanPlay` prop: with `autoPlay` and `preload="auto"` a small file
   * can be ready before React has finished attaching listeners, and the event
   * is then simply missed — the video played through to the end while still at
   * opacity 0. Reading `readyState` catches that case, and the listener covers
   * the ordinary one.
   */
  const attachWave = useCallback((node: HTMLVideoElement | null) => {
    if (!node) return
    if (node.readyState >= 2) {
      setWavePlaying(true)
      return
    }
    const onReady = () => setWavePlaying(true)
    node.addEventListener('loadeddata', onReady, { once: true })
  }, [])

  // On a touch device nothing is shown until the wave has had its say, so the
  // cut-out still does not flash up behind it for a moment first. The timeout
  // is the escape hatch: a video that stalls without erroring must not leave
  // the hero empty, so after it the still is shown regardless.
  useEffect(() => {
    if (wavePlaying || waveBroken) {
      setWaveSettled(true)
      return
    }
    const timer = setTimeout(() => setWaveSettled(true), 2500)
    return () => clearTimeout(timer)
  }, [wavePlaying, waveBroken])
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
  // stands in, and the wave plays over it once.
  //
  // The wave keeps its own backdrop and sits in a frame, rather than being cut
  // out like the sheet is. It was shot with a pool of light in the middle that
  // the backdrop fit — which reads the borders, and they are vignetted — comes
  // in about 20 levels under, so the matte swallowed the gap between the raised
  // arm and the body and pasted a slab of backdrop onto the character. A frame
  // is the honest answer: it looks chosen, and it cannot fail.
  //
  // The still stays underneath as the layer that holds the size and marks the
  // character ready, and it is what shows if the video is missing.
  const src = tracks ? SHEET : STILL
  const neutral = manifest.neutral
  const wave = !tracks && !waveBroken
  // The wave is a 16:9 shot. The head sits at x=630 of 1280 and the raised hand
  // reaches out to x=146, so the furthest the subject gets from the head is
  // 484px — a crop centred on the head has to be at least 968 wide to hold the
  // whole gesture, and 1048 leaves it room to breathe. Against the full 720 of
  // height that is an aspect of 1.46, and `object-position` puts the crop's
  // centre on the head rather than on the frame's, so the head lands in the
  // middle of the box and the distance to either side of it is the same.
  // The still is contained inside the same box if the video never arrives.
  const aspect = tracks ? `${manifest.frameWidth} / ${manifest.frameHeight}` : '1.46'
  const visible = tracks || waveSettled

  return (
    <div
      className="character"
      ref={stage}
      style={{
        // Every size and offset comes from characterConfig.
        width: LAYOUT.width,
        maxWidth: LAYOUT.maxWidth,
        aspectRatio: aspect,
        translate: `${LAYOUT.offsetX} ${LAYOUT.offsetY}`,
        ['--character-cols' as string]: tracks ? manifest.columns : 1,
        ['--character-rows' as string]: tracks ? manifest.rows : 1,
        ['--character-mobile-max' as string]: LAYOUT.mobileMaxWidth,
      }}
      data-ready={(ready && visible) || undefined}
      data-wave={wavePlaying || undefined}
      data-still={!tracks || undefined}
    >
      <img
        className="character__sheet"
        // Hidden, not unmounted: it still carries the size, and it comes back
        // if the video turns out to be unplayable.
        data-covered={wavePlaying || undefined}
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
          ref={attachWave}
          data-playing={wavePlaying || undefined}
          onError={() => setWaveBroken(true)}
        />
      ) : null}
      <p className="visually-hidden">{t.a11y.character}</p>
    </div>
  )
}

function noop() {}
