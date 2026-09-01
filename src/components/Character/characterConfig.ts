/**
 * ===========================================================================
 * Character tuning — everything adjustable lives here
 * ===========================================================================
 *
 * The character is the clip in `public/images/final.mp4`, kept as a sheet of
 * frames in the order they were filmed (`scripts/build-character.py`). The
 * cursor does not pick a picture: it picks a position in the clip, and the
 * runtime walks there one frame at a time, so what plays is the movement that
 * was actually recorded.
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
 *  as a fraction of the reach above. Stops the character drifting when the
 *  cursor is parked. */
export const DEAD_ZONE = 0.1

/** How quickly the aimed-at gaze catches up to the pointer. Higher is more
 *  immediate, lower is more languid. Frame-rate independent: this is the
 *  exponential rate, not a per-frame fraction. */
export const SMOOTHING = 7.5

/** Gaze is clamped to this before the clip position is chosen, so a cursor at
 *  the far edge of a wide monitor reads the same as one just outside the reach. */
export const MAX_GAZE = 1

/** How quickly the character sets off towards the frame it is aiming for.
 *  Same exponential rate as SMOOTHING, applied to position in the clip. */
export const FOLLOW = 6

/**
 * Ceiling on how fast the clip is allowed to run, in sheet frames per second.
 * This is the single most important number for how the movement reads.
 *
 * The sheet holds 120 frames of a 10-second clip, so 12 is the speed it was
 * filmed at. Above roughly 60 the walk starts skipping frames on a 60 Hz
 * screen and the point of all this is lost; well below 12 it feels underwater.
 * 48 is a brisk four times life speed — quick to answer, still every frame.
 */
export const MAX_TRAVEL = 48

/**
 * Mild preference for a frame near where we already are, when two parts of the
 * clip look the same direction. Without it the aim flips between distant
 * matches and the head sets off, turns round and comes back; a little of it
 * removes almost all of that hesitation and costs very little accuracy. Raising
 * it much further traps the character short of the direction being asked for.
 */
export const LOCALITY = 0.6

/** Size and placement inside the hero, straight into CSS. Nothing here moves at
 *  runtime — the character is physically fixed and only the frame changes. */
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
