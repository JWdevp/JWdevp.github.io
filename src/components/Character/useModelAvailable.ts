import { useEffect, useState } from 'react'

export type ModelStatus = 'checking' | 'available' | 'missing'

/**
 * Probes for the GLB before React ever suspends on it.
 *
 * `public/models/character.glb` is intentionally absent from the repository, and
 * a dev server answers a missing asset with the SPA's index.html rather than a
 * hard 404 — which would make the loader choke on HTML. Checking the response
 * type up front keeps the placeholder path clean and lets the real model take
 * over automatically the moment the file is dropped in.
 */
export function useModelAvailable(url: string): ModelStatus {
  const [status, setStatus] = useState<ModelStatus>('checking')

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    fetch(url, { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        if (cancelled) return
        const type = response.headers.get('content-type') ?? ''
        const looksLikeHtml = type.includes('text/html')
        setStatus(response.ok && !looksLikeHtml ? 'available' : 'missing')
      })
      .catch(() => {
        if (!cancelled) setStatus('missing')
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [url])

  return status
}
