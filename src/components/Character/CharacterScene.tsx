import { ContactShadows } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import { SITE } from '../../config/site'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useTheme } from '../../hooks/useTheme'
import { Character } from './Character'
import { CharacterErrorBoundary } from './CharacterErrorBoundary'
import { CharacterPlaceholder } from './CharacterPlaceholder'
import { useModelAvailable } from './useModelAvailable'
import './character.css'

/**
 * The Hero's 3D stage.
 *
 * The device pixel ratio is capped at 1.75, the lighting is analytic (no HDRI
 * is fetched at runtime), and reduced-motion visitors keep a live loop but lose
 * every autonomous animation — see CharacterPlaceholder.
 */
export function CharacterScene() {
  const { theme } = useTheme()
  const reducedMotion = usePrefersReducedMotion()
  const modelStatus = useModelAvailable(SITE.characterModel)
  const stageRef = useRef<HTMLDivElement>(null)
  const [greetKey, setGreetKey] = useState(0)

  // Wave again whenever the hero comes back into view, so the greeting is not
  // a one-shot the visitor can miss while the 3D chunk is still loading.
  useEffect(() => {
    const node = stageRef.current
    if (!node) return
    let wasVisible = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasVisible) setGreetKey((k) => k + 1)
        wasVisible = entry.isIntersecting
      },
      { threshold: 0.55 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const placeholder = (
    <CharacterPlaceholder
      scale={0.96}
      position={[0, 0.3, 0]}
      reducedMotion={reducedMotion}
      theme={theme}
      greetKey={greetKey}
    />
  )

  return (
    <div className="character-stage" ref={stageRef} aria-hidden="true">
      <div className="character-stage__glow" />
      <Canvas
        className="character-stage__canvas"
        shadows
        dpr={[1, 1.75]}
        /* Always live. Under reduced motion the character drops the wave, the
           float and the breathing, but the gaze still needs frames to render —
           freezing the loop here made the whole scene look broken. */
        frameloop="always"
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.05, 4.6], fov: 34, near: 0.1, far: 20 }}
      >
        {/* Four lights, no HDRI: nothing is fetched at runtime. */}
        <ambientLight intensity={theme === 'dark' ? 0.62 : 0.95} />
        <directionalLight
          position={[2.2, 3, 3.2]}
          intensity={theme === 'dark' ? 1.5 : 2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.5}
          shadow-camera-far={12}
        />
        {/* Warm rim from the left keeps the hair and beard from going flat */}
        <directionalLight
          position={[-3.2, 1.6, -1.6]}
          intensity={theme === 'dark' ? 0.85 : 0.6}
          color={theme === 'dark' ? '#8ba2ff' : '#ffd9c2'}
        />
        {/* Soft bounce from below, so the jaw and the underside of the chin
            never fall into pure shadow */}
        <directionalLight position={[0, -2, 2.4]} intensity={0.32} color="#ffffff" />

        <Suspense fallback={placeholder}>
          {modelStatus === 'available' ? (
            <CharacterErrorBoundary fallback={placeholder}>
              <Character
                url={SITE.characterModel}
                scale={1}
                position={[0, -1.15, 0]}
                reducedMotion={reducedMotion}
              />
            </CharacterErrorBoundary>
          ) : (
            placeholder
          )}
        </Suspense>

        <ContactShadows
          position={[0, -1.45, 0]}
          opacity={theme === 'dark' ? 0.42 : 0.28}
          scale={5}
          blur={2.6}
          far={3}
          resolution={512}
          frames={reducedMotion ? 1 : Infinity}
        />
      </Canvas>
    </div>
  )
}
