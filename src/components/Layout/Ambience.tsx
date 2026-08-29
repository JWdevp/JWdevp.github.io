import './ambience.css'

/**
 * Two very quiet background layers: a wide radial wash that gives the page a
 * light source, and a fine grain that keeps large flat areas from banding.
 * Both are purely decorative and cost nothing at runtime.
 */
export function Ambience() {
  return (
    <div className="ambience" aria-hidden="true">
      <div className="ambience__wash" />
      <div className="ambience__grain" />
    </div>
  )
}
