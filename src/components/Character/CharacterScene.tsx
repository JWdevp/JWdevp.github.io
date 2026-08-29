import { ContactShadows, PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
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
 * Everything expensive is conditional: reduced-motion visitors get a single
 * rendered frame (`frameloop="demand"`), the device pixel ratio is capped, and
 * the resolution is dialled back automatically if the frame rate drops.
 */
export function CharacterScene() {
  const { theme } = useTheme()
  const reducedMotion = usePrefersReducedMotion()
  const modelStatus = useModelAvailable(SITE.characterModel)
  const [dprCap, setDprCap] = useState(1.75)

  const placeholder = (
    <CharacterPlaceholder
      scale={1.2}
      position={[0, -0.18, 0]}
      reducedMotion={reducedMotion}
      theme={theme}
    />
  )

  return (
    <div className="character-stage" aria-hidden="true">
      <div className="character-stage__glow" />
      <Canvas
        className="character-stage__canvas"
        shadows
        dpr={[1, dprCap]}
        frameloop={reducedMotion ? 'demand' : 'always'}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.05, 4.9], fov: 34, near: 0.1, far: 20 }}
      >
        <PerformanceMonitor
          onDecline={() => setDprCap(1)}
          onIncline={() => setDprCap(1.75)}
        />

        {/* Three lights, no HDRI: nothing is fetched at runtime. */}
        <ambientLight intensity={theme === 'dark' ? 0.55 : 0.85} />
        <directionalLight
          position={[2.4, 3.2, 2.6]}
          intensity={theme === 'dark' ? 1.5 : 2.1}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-near={0.5}
          shadow-camera-far={12}
        />
        <directionalLight
          position={[-3, 1.4, -2]}
          intensity={theme === 'dark' ? 0.7 : 0.45}
          color={theme === 'dark' ? '#6f8cff' : '#ffd9c2'}
        />

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
          position={[0, -1.24, 0]}
          opacity={theme === 'dark' ? 0.42 : 0.28}
          scale={6}
          blur={2.6}
          far={3}
          resolution={512}
          frames={reducedMotion ? 1 : Infinity}
        />
      </Canvas>
    </div>
  )
}
