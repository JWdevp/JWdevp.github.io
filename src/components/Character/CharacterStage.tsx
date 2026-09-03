import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { announceGreetingDone } from '../../hooks/useGreeting'
import { useLanguage } from '../../hooks/useLanguage'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { CLIP_FADE, FOLLOW, IDLE_REST, LAYOUT, MAX_TRAVEL } from './characterConfig'
import manifest from './manifest.json'
import { useGazeTracking, type Gaze } from './useGazeTracking'
import './character.css'

const SHEET = `${import.meta.env.BASE_URL}character/${manifest.sprite}`
const STILL = `${import.meta.env.BASE_URL}character/${manifest.still}`
/** Touch devices get a wave instead of tracking. Not built by the pipeline —
 *  drop the file in and it is used; if it is not there, the still is. */
const WAVE = `${import.meta.env.BASE_URL}character/wave.mp4`
/** The resting loop the character falls into once the greeting is over. Same
 *  framing as the wave — measured, the head sits at 49.2% of the width against
 *  the wave's 49.1% — so the two share a box and a crop. */
const IDLE = `${import.meta.env.BASE_URL}character/idle.mp4`

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
 * The sheet never crossfades. Two of its frames are never mixed, so there is no
 * ghosting — the smoothness comes from the steps being small, not from
 * blending. (The two video clips a touch device gets do dissolve into each
 * other; that is a different problem, and the note is on them.)
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
  const waveNode = useRef<HTMLVideoElement | null>(null)

  /**
   * What the character is doing.
   *
   * `greeting` is the wave on arrival, `wave` the same clip played again on a
   * tap; both show the wave element, which is why they are not one state — the
   * greeting announces itself to the rest of the page and a replay does not.
   * `idle` covers the resting clip both while it runs and while it holds on its
   * last frame between takes, because those look identical and differ only in
   * whether a timer is pending.
   */
  const [phase, setPhase] = useState<'greeting' | 'idle' | 'wave'>('greeting')
  /** The greeting is over, so a tap on the character means something. */
  const [greetingOver, setGreetingOver] = useState(false)
  const [idleBroken, setIdleBroken] = useState(false)
  const idleNode = useRef<HTMLVideoElement | null>(null)
  /** A tap arrived mid-take. The wave waits for the idle to finish. */
  const waveQueued = useRef(false)
  const restTimer = useRef<number | undefined>(undefined)
  /** Whether the idle clip is actually running, as opposed to holding its last
   *  frame. A tap during the hold has nothing to wait for. */
  const idleRunning = useRef(false)
  const reduced = usePrefersReducedMotion()
  /** The greeting is handing over to the idle for the first and only time, and
   *  gets a longer dissolve for it. */
  const [settling, setSettling] = useState(false)
  const firstTake = useRef(true)
  const settleTimer = useRef<number | undefined>(undefined)

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
    waveNode.current = node
    if (!node) return
    // Failure races the listener in exactly the same way readiness does, and
    // loses in the same place: an unsupported codec or a missing file is
    // settled before React attaches `onError`, so the element sits there
    // already broken with nobody told. Read the state rather than wait to be
    // informed of it — otherwise the page spends the full backstop waiting for
    // a greeting that was never going to happen.
    if (node.error || node.networkState === node.NETWORK_NO_SOURCE) {
      setWaveBroken(true)
      return
    }
    if (node.readyState >= 2) {
      setWavePlaying(true)
      return
    }
    const onReady = () => setWavePlaying(true)
    const onFail = () => setWaveBroken(true)
    node.addEventListener('loadeddata', onReady, { once: true })
    node.addEventListener('error', onFail, { once: true })
  }, [])

  /** Watch the idle for a file that is missing or cannot be decoded, the same
   *  way the wave is watched and for the same reason: the failure is often
   *  settled before React attaches `onError`. */
  const attachIdle = useCallback((node: HTMLVideoElement | null) => {
    idleNode.current = node
    if (!node) return
    if (node.error || node.networkState === node.NETWORK_NO_SOURCE) {
      setIdleBroken(true)
      return
    }
    node.addEventListener('error', () => setIdleBroken(true), { once: true })
  }, [])

  /**
   * The rest between takes, and the take after it.
   *
   * These two call each other, so one of them has to be reachable through a ref
   * — a plain pair of `useCallback`s cannot close over each other. The timer
   * reads the latest `startIdle` at the moment it fires rather than the one that
   * existed when it was set, which also means a change of motion preference
   * takes effect on the next rest rather than being baked in at mount.
   */
  const startIdleRef = useRef<() => void>(() => {})

  const rest = useCallback(() => {
    const min = reduced ? IDLE_REST.reducedMin : IDLE_REST.min
    const max = reduced ? IDLE_REST.reducedMax : IDLE_REST.max
    const wait = (min + Math.random() * (max - min)) * 1000
    window.clearTimeout(restTimer.current)
    restTimer.current = window.setTimeout(() => startIdleRef.current(), wait)
  }, [reduced])

  const startIdle = useCallback(() => {
    const node = idleNode.current
    if (!node) return
    // Only the handover from the greeting is slowed, and only while it lasts.
    // The flag is dropped a fade's length after the leaving clip has finished
    // its own, so the length is never changed underneath a running transition.
    if (firstTake.current) {
      firstTake.current = false
      setSettling(true)
      settleTimer.current = window.setTimeout(
        () => setSettling(false),
        CLIP_FADE.first * 2 + 200,
      )
    }
    setPhase('idle')
    node.currentTime = 0
    idleRunning.current = true
    const started = node.play()
    // A refusal is not fatal here: the character simply keeps holding its last
    // frame and the next rest tries again.
    if (started) {
      started.catch(() => {
        idleRunning.current = false
        rest()
      })
    }
  }, [rest])

  useEffect(() => {
    startIdleRef.current = startIdle
  }, [startIdle])

  /**
   * Wave again, on a tap inside the frame.
   *
   * `play()` can be refused — a phone that has decided this page may not start
   * media, say — and rather than leave the character stranded on the wave's last
   * frame, a refusal drops straight back into the idle cycle.
   */
  const playWave = useCallback(() => {
    const node = waveNode.current
    if (!node) {
      rest()
      return
    }
    waveQueued.current = false
    setPhase('wave')
    node.currentTime = 0
    const started = node.play()
    if (started) started.catch(() => startIdleRef.current())
  }, [rest])

  /**
   * A tap on the character.
   *
   * Mid-take the wave is queued rather than cut in, which is the point: the idle
   * is allowed to finish first. Between takes there is nothing to finish, so the
   * pending rest is cancelled and the wave goes now — waiting out a timer the
   * reader cannot see would just read as the tap having been ignored.
   */
  const onTap = useCallback(() => {
    if (phase === 'wave') return
    if (idleBroken) {
      playWave()
      return
    }
    if (idleRunning.current) {
      waveQueued.current = true
      return
    }
    window.clearTimeout(restTimer.current)
    playWave()
  }, [phase, idleBroken, playWave])

  /** The timers are the things here that outlive the component if left. */
  useEffect(
    () => () => {
      window.clearTimeout(restTimer.current)
      window.clearTimeout(settleTimer.current)
    },
    [],
  )

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

  /**
   * Tell the rest of the page when the greeting is over — the settings island
   * waits for it before showing itself on a phone.
   *
   * A pointer device never gets the wave, and neither does one where the file
   * is missing, so in both cases there is nothing to wait for and the signal
   * goes immediately. Otherwise the video's own `ended` announces it, and this
   * timer is the backstop: a stalled video must not leave the corner waiting
   * for ever. Eight seconds against a four-second clip, so it only ever fires
   * when something has genuinely gone wrong.
   */
  useEffect(() => {
    if (tracks) {
      announceGreetingDone()
      return
    }
    // The wave got there under its own steam and has already handed over to the
    // idle. Re-running clears the backstop below, which is the point: left
    // pending it would fire mid-take and restart the idle from the top.
    if (greetingOver) return

    const settle = () => {
      announceGreetingDone()
      setGreetingOver(true)
      // A missing or stalled wave must not take the idle down with it. The
      // greeting is what failed; the character can still rest and be tapped.
      if (!idleBroken) startIdleRef.current()
    }
    if (waveBroken) {
      settle()
      return
    }
    const timer = setTimeout(settle, 8000)
    return () => clearTimeout(timer)
  }, [tracks, waveBroken, idleBroken, greetingOver])

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
  /** Either clip showing means the framed shot rather than the cut-out sheet,
   *  so the bust fade comes off and the still underneath goes. */
  const filmShowing = wavePlaying || phase === 'idle'
  const idle = !tracks && !idleBroken

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
        // Drives both the arriving clip's fade and the leaving clip's delay,
        // so the two cannot come apart. See CLIP_FADE.
        ['--clip-fade' as string]: `${settling ? CLIP_FADE.first : CLIP_FADE.normal}ms`,
      }}
      data-ready={(ready && visible) || undefined}
      data-wave={filmShowing || undefined}
      data-still={!tracks || undefined}
    >
      <img
        className="character__sheet"
        // Hidden, not unmounted: it still carries the size, and it comes back
        // if the video turns out to be unplayable.
        data-covered={filmShowing || undefined}
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
          data-playing={(wavePlaying && phase !== 'idle') || undefined}
          onEnded={() => {
            announceGreetingDone()
            setGreetingOver(true)
            // With no idle to fall into, the character holds the wave's last
            // frame exactly as it did before this existed.
            if (!idleBroken) startIdleRef.current()
          }}
          onError={() => setWaveBroken(true)}
        />
      ) : null}
      {/* The resting clip. Same box and crop as the wave, stacked over it, so
          the swap between the two is a crossfade of two shots that already line
          up rather than a cut. Measured, all three seams — the idle's own wrap,
          greeting to idle, and idle to replay — are about twenty times a normal
          frame-to-frame step, so one fade covers all of them.

          No `loop`: the pause between takes is the whole design, so each take
          is started deliberately. */}
      {idle ? (
        <video
          className="character__idle"
          src={IDLE}
          muted
          playsInline
          preload="auto"
          ref={attachIdle}
          data-playing={(phase === 'idle') || undefined}
          onEnded={() => {
            idleRunning.current = false
            if (waveQueued.current) playWave()
            else rest()
          }}
          onError={() => setIdleBroken(true)}
        />
      ) : null}
      {/* Sits over the frame from the moment the greeting is done, so a tap
          lands whether the character is mid-take or resting between them.
          A button rather than a click handler on the video, so it can be
          reached by keyboard and says what it does. */}
      {wave && greetingOver ? (
        <button
          type="button"
          className="character__replay"
          onClick={onTap}
          aria-label={t.a11y.replayGreeting}
        />
      ) : null}
      <p className="visually-hidden">{t.a11y.character}</p>
    </div>
  )
}

function noop() {}
