'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/lib/game/store';
import { YutThrow } from '@/lib/game/types';
import { soundManager } from '@/lib/sound/sounds';

// Single yut stick
interface YutStickProps {
  index: number;
  throwResult: YutThrow | null;
  isThrown: boolean;
  onAnimationEnd: () => void;
}

function YutStick({ index, throwResult, isThrown, onAnimationEnd }: YutStickProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [landed, setLanded] = useState(false);

  // Initial random rotation and position per stick
  const seed = useMemo(() => ({
    rotX: Math.random() * Math.PI * 2,
    rotY: Math.random() * Math.PI * 2,
    rotZ: Math.random() * Math.PI * 2,
    offsetX: (Math.random() - 0.5) * 1.5,
    offsetZ: (Math.random() - 0.5) * 1.5,
    spinSpeed: 8 + Math.random() * 6,
  }), []);

  // Animation timeline
  const startTime = useRef(0);
  const hasEnded = useRef(false);

  useEffect(() => {
    if (isThrown) {
      startTime.current = performance.now();
      setLanded(false);
      hasEnded.current = false;
    }
  }, [isThrown]);

  useFrame(() => {
    if (!meshRef.current || !isThrown) return;
    const elapsed = (performance.now() - startTime.current) / 1000;
    const throwDuration = 1.5; // seconds
    const landDuration = 0.5;

    if (elapsed < throwDuration) {
      // Throwing phase - sticks fly up and rotate
      const t = elapsed / throwDuration;
      const arc = Math.sin(t * Math.PI) * 4; // arc height

      meshRef.current.position.set(
        seed.offsetX * (1 + t),
        -2 + arc,
        seed.offsetZ * (1 + t) - 2,
      );
      meshRef.current.rotation.set(
        seed.rotX + t * seed.spinSpeed,
        seed.rotY + t * seed.spinSpeed * 0.7,
        seed.rotZ + t * seed.spinSpeed * 0.5,
      );

      // Play stickHit sounds at intervals
      if (Math.floor(elapsed * 8) !== Math.floor((elapsed - 0.016) * 8) && elapsed > 0.3 && elapsed < 1.3) {
        if (Math.random() < 0.4) {
          soundManager.play('stickHit');
        }
      }
    } else if (elapsed < throwDuration + landDuration) {
      // Landing phase - sticks settle
      const t = (elapsed - throwDuration) / landDuration;
      const easedT = 1 - Math.pow(1 - t, 3); // ease out

      // Determine target rotation based on result
      const isFront = throwResult ? throwResult.sticks[index] : false;

      // Front (round up) = X rotation ~0, Back (flat down) = X rotation ~PI/2
      const targetRotX = isFront ? 0 : Math.PI / 2;
      const targetRotY = 0;
      const targetRotZ = (index - 1.5) * 0.3; // slight spread

      // Start from current rotation
      const startRotX = seed.rotX + seed.spinSpeed;
      const startRotY = seed.rotY + seed.spinSpeed * 0.7;
      const startRotZ = seed.rotZ + seed.spinSpeed * 0.5;

      meshRef.current.rotation.set(
        startRotX + (targetRotX - startRotX) * easedT,
        startRotY + (targetRotY - startRotY) * easedT,
        startRotZ + (targetRotZ - startRotZ) * easedT,
      );

      // Position settles
      const finalX = (index - 1.5) * 0.6 + seed.offsetX * 0.3;
      const finalZ = seed.offsetZ * 0.3;
      meshRef.current.position.set(
        THREE.MathUtils.lerp(seed.offsetX * 2, finalX, easedT),
        THREE.MathUtils.lerp(-2 + 0, 0, easedT),
        THREE.MathUtils.lerp(seed.offsetZ * 2 - 2, finalZ, easedT),
      );

      // Landing sound at start of land phase
      if (!landed) {
        setLanded(true);
        soundManager.play('stickLand');
      }
    } else {
      // Final state - settle
      if (!hasEnded.current) {
        hasEnded.current = true;
        // Wait a bit then signal end
        setTimeout(() => onAnimationEnd(), 600);
      }
      // Keep sticks in final position
      const isFront = throwResult ? throwResult.sticks[index] : false;
      const targetRotX = isFront ? 0 : Math.PI / 2;
      meshRef.current.rotation.set(targetRotX, 0, (index - 1.5) * 0.3);
      meshRef.current.position.set((index - 1.5) * 0.6 + seed.offsetX * 0.3, 0, seed.offsetZ * 0.3);
    }
  });

  // Stick dimensions: long rounded cylinder
  return (
    <group ref={meshRef} position={[0, -2, -2]}>
      {/* The yut stick is a half-round cylinder (flat on one side, round on the other) */}
      <group>
        {/* Main stick body - half-round */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.12, 0.12, 2.2, 16, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#8B5A2B" roughness={0.7} metalness={0.05} />
        </mesh>
        {/* Flat side (back) */}
        <mesh castShadow receiveShadow rotation={[0, 0, 0]}>
          <boxGeometry args={[0.24, 2.2, 0.06]} />
          <meshStandardMaterial color="#5C3A1A" roughness={0.85} />
        </mesh>
        {/* Front marking (decorative line) */}
        <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.015, 8, 16]} />
          <meshStandardMaterial color="#3D2410" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// Ground plane - white/light background for clear stick visibility
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.85} metalness={0.0} />
    </mesh>
  );
}

// Lighting - bright and clear for stick visibility
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <pointLight position={[-3, 3, -3]} intensity={0.4} color="#FFE4B5" />
      <spotLight
        position={[0, 6, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={0.5}
        color="#FFFFFF"
      />
    </>
  );
}

interface YutThrow3DProps {
  isThrown: boolean;
  throwResult: YutThrow | null;
  onAnimationEnd: () => void;
}

export function YutThrow3D({ isThrown, throwResult, onAnimationEnd }: YutThrow3DProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 3.5, 5], fov: 50 }}
      style={{ width: '100%', height: '100%', background: '#FFFFFF' }}
      gl={{ alpha: false, antialias: true }}
    >
      <color attach="background" args={['#FFFFFF']} />
      <Lighting />
      <Ground />
      {[0, 1, 2, 3].map((i) => (
        <YutStick
          key={i}
          index={i}
          throwResult={throwResult}
          isThrown={isThrown}
          onAnimationEnd={onAnimationEnd}
        />
      ))}
    </Canvas>
  );
}
