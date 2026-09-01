import { useCallback, useRef, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { LAYOUT } from './characterConfig'
import manifest from './manifest.json'
import { useGazeTracking, type Gaze } from './useGazeTracking'
import './character.css'

const SHEET = `${import.meta.env.BASE_URL}character/${manifest.sprite}`
const LOOKUP_MAX = manifest.lookupSize - 1

/**
 * The hero character.
 *
 * One image — a sheet of head poses cut from the source video — inside a window
 * the size of a single pose. The cursor chooses which pose shows; the character
 * itself never moves, scales or rotates.
 *
 * Poses rather than the video: the cursor needs random access to a direction,
 * and `video.currentTime` seeking stutters under that. Poses also let the
 * backdrop be removed properly, so the character sits on the page's own
 * background in either theme instead of on a white rectangle.
 *
 * Switching pose is a `translate3d` on the sheet, which the compositor handles
 * without repainting, and it happens inside the animation frame — React never
 * re-renders while the cursor moves.
 */
export function CharacterStage() {
  const { t } = useLanguage()
  const stage = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLImageElement>(null)
  const shown = useRef(-1)
  const [ready, setReady] = useState(false)

  const render = useCallback((gaze: Gaze) => {
    const img = sheet.current
    if (!img) return

    // The lookup was baked per cursor cell at build time, so the nearest pose is
    // one array read rather than a scan over every pose each frame.
    const col = Math.round(((gaze.x + 1) / 2) * LOOKUP_MAX)
    const row = Math.round(((1 - gaze.y) / 2) * LOOKUP_MAX)
    const pose = manifest.lookup[clamp(row, 0, LOOKUP_MAX)][clamp(col, 0, LOOKUP_MAX)]
    if (pose === shown.current) return
    shown.current = pose

    const x = (pose % manifest.columns) / manifest.columns
    const y = Math.floor(pose / manifest.columns) / manifest.rows
    img.style.transform = `translate3d(${-x * 100}%, ${-y * 100}%, 0)`
  }, [])

  useGazeTracking(stage, render)

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
        ['--character-cols' as string]: manifest.columns,
        ['--character-rows' as string]: manifest.rows,
        ['--character-mobile-max' as string]: LAYOUT.mobileMaxWidth,
      }}
      data-ready={ready || undefined}
    >
      <img
        className="character__sheet"
        ref={sheet}
        src={SHEET}
        alt=""
        draggable={false}
        decoding="async"
        onLoad={() => setReady(true)}
      />
      <p className="visually-hidden">{t.a11y.character}</p>
    </div>
  )
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}
