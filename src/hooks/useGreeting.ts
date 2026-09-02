import { useEffect, useState } from 'react'

/**
 * "The greeting has finished."
 *
 * The wave plays inside the hero and the thing that waits for it — the settings
 * island — sits in the corner, a sibling of the hero rather than a child. Rather
 * than thread a callback up through App and back down, the hero announces it
 * once and whoever cares subscribes.
 *
 * The flag is STICKY, and that is the point. The wave is four seconds long but
 * a cached video on a fast phone can be through it before a listener has
 * mounted, and a subscriber that arrives late would then wait for an
 * announcement that already happened. Reading the flag on subscribe means the
 * order the two mount in does not matter.
 */
let done = false
const listeners = new Set<() => void>()

/** Called by the hero when the greeting is over — or when it is established
 *  that there will not be one. Announcing twice is harmless. */
export function announceGreetingDone() {
  if (done) return
  done = true
  for (const listener of listeners) listener()
}

export function useGreetingDone() {
  const [finished, setFinished] = useState(done)

  useEffect(() => {
    if (done) {
      setFinished(true)
      return
    }
    const listener = () => setFinished(true)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return finished
}
