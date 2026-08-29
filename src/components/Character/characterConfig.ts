/**
 * ===========================================================================
 * Character tuning — the one file to edit when you swap in your own model
 * ===========================================================================
 *
 * Nothing here is required for the model to load. The defaults are chosen so a
 * standard humanoid avatar (Ready Player Me, Mixamo, VRoid, or anything with a
 * `Head` bone) drops in and frames itself correctly. These knobs exist for the
 * cases where it does not.
 */

/** How far each body part turns towards the pointer, in radians. */
export interface TrackingLimits {
  /** Eyes move most — they are what sells "it is looking at me". */
  MAX_EYE_ROTATION: number
  /** The head carries the bulk of the visible motion. */
  MAX_HEAD_ROTATION: number
  /** The neck follows a little. */
  MAX_NECK_ROTATION: number
  /** The torso barely moves — just enough to avoid a floating head. */
  MAX_TORSO_ROTATION: number
  /** Higher = snappier. Frame-rate independent (exponential smoothing). */
  DAMPING: number
}

export const TRACKING_LIMITS: TrackingLimits = {
  MAX_EYE_ROTATION: 0.26,
  MAX_HEAD_ROTATION: 0.42,
  MAX_NECK_ROTATION: 0.16,
  MAX_TORSO_ROTATION: 0.06,
  DAMPING: 5.2,
}

/** Vertical range as a fraction of the horizontal: necks nod less than they turn. */
export const VERTICAL_SCALE = 0.62

/**
 * Which way the rig faces.
 *
 * The defaults assume the model looks down +Z, towards the camera — the glTF
 * convention, and what Ready Player Me, Mixamo and VRoid all export.
 *
 * If your character looks *away* from the pointer, flip `yawSign` to -1.
 * If it looks up when the cursor goes down, flip `pitchSign` to -1.
 * Those two flags cover every rig orientation you are likely to hit.
 */
export const ORIENTATION = {
  yawSign: 1 as 1 | -1,
  pitchSign: 1 as 1 | -1,
}

/**
 * Automatic framing.
 *
 * Avatars arrive at wildly different scales — a Ready Player Me export is about
 * 1.7 units tall (metres), a sculpt from an image-to-3D tool can be 0.1 or 100.
 * Rather than making you guess a scale factor, the loader measures the model and
 * fits it to these targets, cropping to a head-and-shoulders bust.
 *
 * Values are in world units for the hero camera; the built-in stand-in sits at
 * roughly a 1.0 head with its centre at y = 0.35.
 */
export const FRAMING = {
  /** Target head diameter once scaled. Raise it to zoom in. */
  headDiameter: 1,
  /** Where the head centre ends up vertically. Raise it to sit the head higher. */
  headY: 0.35,
  /** Fallback when the rig has no head bone: fit the whole model to this height. */
  fullHeight: 2.6,
} as const

/** Seconds spent blending the pointer offset in once idle begins. */
export const TRACKING_RAMP = 0.8
