'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { YutThrow } from '@/lib/game/types';
import { soundManager } from '@/lib/sound/sounds';

// Single yut stick - designed with clear front/back distinction
interface YutStickProps {
  index: number;
  throwResult: YutThrow | null;
  isThrown: boolean;
  onAnimationEnd: () => void;
}

function YutStick({ index, throwResult, isThrown, onAnimationEnd }: YutStickProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [landed, setLanded] = useState(false);

  // Initial random rotation and position per stick - wider spread
  const seed = useMemo(() => ({
    rotX: Math.random() * Math.PI * 2,
    rotY: Math.random() * Math.PI * 2,
    rotZ: Math.random() * Math.PI * 2,
    offsetX: (index - 1.5) * 0.3 + (Math.random() - 0.5) * 0.4,
    offsetZ: (Math.random() - 0.5) * 0.6,
    spinSpeed: 6 + Math.random() * 4,
  }), [index]);

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
    const throwDuration = 1.3; // seconds
    const landDuration = 0.4;

    if (elapsed < throwDuration) {
      // Throwing phase - sticks fly up and rotate
      const t = elapsed / throwDuration;
      const arc = Math.sin(t * Math.PI) * 2.2; // arc height

      const startX = seed.offsetX;
      const startZ = seed.offsetZ - 0.5;
      meshRef.current.position.set(
        startX,
        0.4 + arc,
        startZ,
      );
      // During throwing, sticks tumble in all axes
      meshRef.current.rotation.set(
        seed.rotX + t * seed.spinSpeed,
        seed.rotY + t * seed.spinSpeed * 0.7,
        seed.rotZ + t * seed.spinSpeed * 0.5,
      );

      // Play stickHit sounds at intervals
      if (Math.floor(elapsed * 8) !== Math.floor((elapsed - 0.016) * 8) && elapsed > 0.3 && elapsed < 1.1) {
        if (Math.random() < 0.4) {
          soundManager.play('stickHit');
        }
      }
    } else if (elapsed < throwDuration + landDuration) {
      // Landing phase - sticks settle
      const t = (elapsed - throwDuration) / landDuration;
      const easedT = 1 - Math.pow(1 - t, 3); // ease out

      // Determine target rotation based on result
      // Sticks lie flat on ground (Z-axis rotation = PI/2 makes cylinder horizontal)
      // - Front (round side UP) = rotation around its own axis = 0 (round half on top)
      // - Back (flat side UP) = rotation around its own axis = PI (flat half on top)
      const isFront = throwResult ? throwResult.sticks[index] : false;

      // Base rotation: lay the stick horizontally (rotate Z by PI/2)
      // Then rotate around X (the stick's length axis) to flip front/back
      const baseRotZ = Math.PI / 2; // lay flat
      const flipRotX = isFront ? 0 : Math.PI; // 0 = round up, PI = flat up
      const targetRotX = flipRotX;
      const targetRotY = 0;
      const targetRotZ = baseRotZ + (index - 1.5) * 0.1; // slight tilt variation

      // Start from current rotation (end of throwing)
      const startRotX = seed.rotX + throwDuration * seed.spinSpeed;
      const startRotY = seed.rotY + throwDuration * seed.spinSpeed * 0.7;
      const startRotZ = seed.rotZ + throwDuration * seed.spinSpeed * 0.5;

      meshRef.current.rotation.set(
        startRotX + (targetRotX - startRotX) * easedT,
        startRotY + (targetRotY - startRotY) * easedT,
        startRotZ + (targetRotZ - startRotZ) * easedT,
      );

      // Position settles - arrange sticks in a row, lying on ground
      const finalX = (index - 1.5) * 0.55;
      const finalZ = 0;
      const startX = seed.offsetX;
      const startZ = seed.offsetZ - 0.5;
      // Y = 0.18 (stick radius) so it rests on ground
      meshRef.current.position.set(
        THREE.MathUtils.lerp(startX, finalX, easedT),
        THREE.MathUtils.lerp(0.4, 0.18, easedT),
        THREE.MathUtils.lerp(startZ, finalZ, easedT),
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
        setTimeout(() => onAnimationEnd(), 600);
      }
      const isFront = throwResult ? throwResult.sticks[index] : false;
      const baseRotZ = Math.PI / 2;
      const flipRotX = isFront ? 0 : Math.PI;
      meshRef.current.rotation.set(flipRotX, 0, baseRotZ + (index - 1.5) * 0.1);
      meshRef.current.position.set((index - 1.5) * 0.55, 0.18, 0);
    }
  });

  // Stick design: half-round cylinder lying horizontally
  // The cylinder's axis is Y by default. The half-cylinder opens toward -Z.
  // When laid flat (Z rot = PI/2), the length runs along X.
  // - Round half (FRONT) = LIGHT bamboo color (#E8C887)
  // - Flat half (BACK) = DARK brown (#2D1810)
  return (
    <group ref={meshRef} position={[0, 0.4, -0.5]}>
      {/* Round front half (LIGHT) - half cylinder, thicker for better visibility from top */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 1.8, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial
          color="#E8C887"
          roughness={0.5}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Flat back half (DARK) - thicker box for better visibility from top */}
      <mesh castShadow receiveShadow position={[0, 0, -0.09]}>
        <boxGeometry args={[0.36, 1.8, 0.08]} />
        <meshStandardMaterial
          color="#2D1810"
          roughness={0.85}
          metalness={0.0}
        />
      </mesh>

      {/* End caps - front (LIGHT) */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#D4A856" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#D4A856" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* End caps - back (DARK) */}
      <mesh position={[0, 0.9, -0.09]}>
        <boxGeometry args={[0.36, 0.05, 0.08]} />
        <meshStandardMaterial color="#2D1810" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.9, -0.09]}>
        <boxGeometry args={[0.36, 0.05, 0.08]} />
        <meshStandardMaterial color="#2D1810" roughness={0.85} />
      </mesh>
    </group>
  );
}

// Ground plane - soft light background
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial color="#FAFAF7" roughness={0.9} metalness={0.0} />
    </mesh>
  );
}

// Lighting - bright and clear for stick visibility from top-down view
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight
        position={[2, 12, 3]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-3, 8, -2]} intensity={0.6} color="#FFFAF0" />
      <pointLight position={[0, 6, 2]} intensity={0.5} color="#FFFFFF" />
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
      camera={{ position: [0, 8, 1.5], fov: 45 }}
      style={{ width: '100%', height: '100%', background: '#FAFAF7' }}
      gl={{ alpha: false, antialias: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#FAFAF7']} />
      <fog attach="fog" args={['#FAFAF7', 12, 24]} />
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
