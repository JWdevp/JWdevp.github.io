/**
 * The character walks a small, explicit state machine:
 *
 *   INITIALIZING → GREETING → IDLE → TRACKING
 *
 * Tracking stays off until the greeting has finished playing, so the wave is
 * never fighting the cursor. The transition out of GREETING is driven by the
 * mixer's own `finished` event — the real clip duration, not a guessed timeout.
 */
export type CharacterState = 'initializing' | 'greeting' | 'idle' | 'tracking'

/** Seconds spent blending the pointer offset in once idle begins. */
export const TRACKING_RAMP = 0.8
