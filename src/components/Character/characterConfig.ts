/**
 * ===========================================================================
 * Character tuning — everything adjustable lives here
 * ===========================================================================
 *
 * The character is a sprite sheet of head poses cut from `public/images/final.mp4`
 * by `scripts/build-character.py`. The cursor picks a pose; it never moves the
 * character itself.
 */

/** How far the pointer has to travel for the gaze to reach its extreme, as a
 *  fraction of the room between the character's centre and the viewport edge it
 *  is heading for. 1 = full deflection exactly at the edge; smaller = the
 *  character looks all the way over sooner and then holds.
 *
 *  Measuring per side rather than in viewport widths is what keeps left and
 *  right symmetric even though the character sits right of centre. */
export const SENSITIVITY = {
  /** Horizontal reach. 0.85 ≈ maxed out 85% of the way to the edge. */
  x: 0.85,
  /** Vertical reach. Tighter, because a head nods less than it turns. */
  y: 0.7,
}

/** Nothing happens while the pointer is this close to the character's centre,
 *  as a fraction of the reach above. Stops the pose twitching when the cursor
 *  is parked. */
export const DEAD_ZONE = 0.1

/** Follow speed. Higher snaps sooner; lower drifts. Frame-rate independent:
 *  this is the exponential rate, not a per-frame fraction. */
export const SMOOTHING = 7.5

/** Gaze is clamped to this before the pose lookup, so a cursor at the far edge
 *  of a wide monitor does not read differently from one just outside the reach. */
export const MAX_GAZE = 1

/** Size and placement inside the hero, straight into CSS. Nothing here moves at
 *  runtime — the character is physically fixed and only its pose changes. */
export const LAYOUT = {
  /** Width of the character relative to its column. */
  width: '100%',
  /** Largest it is ever drawn, so it stays crisp: the source caps out here. */
  maxWidth: '30rem',
  /** Nudge within the stage, e.g. '0px' / '-1.5rem'. */
  offsetX: '0px',
  offsetY: '0px',
  /** Shrink on small screens, where the hero stacks. */
  mobileMaxWidth: '17rem',
}
