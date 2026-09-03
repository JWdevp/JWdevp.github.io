/**
 * ===========================================================================
 * Character tuning — everything adjustable lives here
 * ===========================================================================
 *
 * The character is one unbroken stretch of `public/images/final.mp4`, kept as a
 * sheet of frames in filming order (`scripts/build-character.py`). The cursor
 * does not pick a picture: it picks a position in that stretch, and the runtime
 * walks there one frame at a time, so what plays is recorded movement.
 *
 * The stretch being unbroken is what keeps the character pointing where the
 * cursor is. Sampled across the whole clip, the same direction recurs several
 * times and the aim jumps between those recurrences, so the head sets off the
 * wrong way and comes back — it looked like it was ignoring you. Within one
 * pass there is nowhere else to go.
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
 * Ceiling on how fast the clip is allowed to run, in frames per second.
 *
 * The sheet holds one unbroken stretch of the recording at its own frame rate,
 * so 24 is life speed. Above about 60 the walk starts skipping frames on a
 * 60 Hz screen and the point of all this is lost; well below 24 it feels
 * underwater.
 *
 * 60, the most that still shows every frame on a 60 Hz screen. The sheet holds
 * 110 frames rather than 72 now, so crossing the whole of it is a longer walk;
 * at the old 48 the far corners took about 1.8s to reach, which reads as the
 * character ignoring you rather than answering slowly. This is the ceiling, so
 * anything further has to come from the sheet being shorter, not the walk
 * being faster.
 */
export const MAX_TRAVEL = 60

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

/**
 * How long the character rests between takes of the idle clip, in seconds.
 *
 * The idle is 5.9s and its last frame is not its first: measured, the wrap is
 * about twenty times a normal frame-to-frame step — a small settle of the head
 * rather than a change of pose. Played back to back that settle would repeat
 * every six seconds and become the thing you notice, so the rest between takes
 * is what the loop is really made of, and it is randomised so the rhythm never
 * becomes predictable.
 *
 * The reduced-motion pair is longer rather than absent, the same rule the rest
 * of the project follows: an idle character that never moves at all reads as a
 * broken video, not as a considerate one.
 */
export const IDLE_REST = {
  min: 10,
  max: 15,
  reducedMin: 30,
  reducedMax: 45,
}

/**
 * How long one clip takes to dissolve into another, in milliseconds.
 *
 * One number, not two, and this is the reason: the clip arriving fades over
 * this, and the clip leaving holds at full opacity for exactly this long before
 * it starts to go. That is what keeps the box covered at every instant — two
 * clips fading in opposite directions do not add up to one in the middle, and
 * measured, the gap that opened let 24.6% of the page through. Tie the two to
 * separate numbers and the flash comes back the moment they drift apart.
 *
 * The greeting hands over more slowly than the rest. It is the one transition
 * nobody asked for — it happens on arrival, unprompted — so it can afford to
 * take its time, where a swap the reader triggered by tapping should answer at
 * once.
 */
export const CLIP_FADE = {
  /** Tap-driven swaps: wave to idle and back. */
  normal: 300,
  /** The greeting settling into the idle, once per visit. */
  first: 1400,
}
