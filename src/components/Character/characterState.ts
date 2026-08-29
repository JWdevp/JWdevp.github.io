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

export { TRACKING_RAMP } from './characterConfig'
