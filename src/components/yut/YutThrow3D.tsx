'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { YutThrow } from '@/lib/game/types';
import { soundManager } from '@/lib/sound/sounds';

// Single yut stick - simple stable box design
interface YutStickProps {
  index: number;
  throwResult: YutThrow | null;
  isThrown: boolean;
  onAnimationEnd: () => void;
}

function YutStick({ index, throwResult, isThrown, onAnimationEnd }: YutStickProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [landed, setLanded] = useState(false);

  // Stable seed per stick
  const seed = useMemo(() => ({
    rotX: Math.random() * Math.PI * 2,
    rotY: Math.random() * Math.PI * 2,
    rotZ: Math.random() * Math.PI * 2,
    offsetX: (Math.random() - 0.5) * 0.8,
    offsetZ: (Math.random() - 0.5) * 0.8,
    spinSpeed: 5 + Math.random() * 3,
  }), []);

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
    const throwDuration = 1.2;
    const landDuration = 0.4;

    if (elapsed < throwDuration) {
      // Throwing phase
      const t = elapsed / throwDuration;
      const arc = Math.sin(t * Math.PI) * 2.0;

      meshRef.current.position.set(
        seed.offsetX * 0.5,
        0.3 + arc,
        seed.offsetZ * 0.5 - 0.3,
      );
      meshRef.current.rotation.set(
        seed.rotX + t * seed.spinSpeed,
        seed.rotY + t * seed.spinSpeed * 0.7,
        seed.rotZ + t * seed.spinSpeed * 0.5,
      );

      if (Math.floor(elapsed * 8) !== Math.floor((elapsed - 0.016) * 8) && elapsed > 0.3 && elapsed < 1.0) {
        if (Math.random() < 0.4) {
          soundManager.play('stickHit');
        }
      }
    } else if (elapsed < throwDuration + landDuration) {
      // Landing phase
      const t = (elapsed - throwDuration) / landDuration;
      const easedT = 1 - Math.pow(1 - t, 3);

      const isFront = throwResult ? throwResult.sticks[index] : false;
      // Lay flat: rotate Z by PI/2. Front = round up (rotX=0), Back = flat up (rotX=PI)
      const targetRotX = isFront ? 0 : Math.PI;
      const targetRotZ = Math.PI / 2;

      const startRotX = seed.rotX + throwDuration * seed.spinSpeed;
      const startRotZ = seed.rotZ + throwDuration * seed.spinSpeed * 0.5;

      meshRef.current.rotation.set(
        startRotX + (targetRotX - startRotX) * easedT,
        0,
        startRotZ + (targetRotZ - startRotZ) * easedT,
      );

      // Scattered landing positions (2x2 grid)
      const gridX = (index % 2) * 2 - 1;
      const gridZ = Math.floor(index / 2) * 2 - 1;
      const finalX = gridX * 0.7;
      const finalZ = gridZ * 0.7;

      meshRef.current.position.set(
        THREE.MathUtils.lerp(seed.offsetX * 0.5, finalX, easedT),
        THREE.MathUtils.lerp(0.3, 0.15, easedT),
        THREE.MathUtils.lerp(seed.offsetZ * 0.5 - 0.3, finalZ, easedT),
      );

      if (!landed) {
        setLanded(true);
        soundManager.play('stickLand');
      }
    } else {
      // Final state
      if (!hasEnded.current) {
        hasEnded.current = true;
        setTimeout(() => onAnimationEnd(), 600);
      }
      const isFront = throwResult ? throwResult.sticks[index] : false;
      const targetRotX = isFront ? 0 : Math.PI;
      const gridX = (index % 2) * 2 - 1;
      const gridZ = Math.floor(index / 2) * 2 - 1;
      meshRef.current.rotation.set(targetRotX, 0, Math.PI / 2);
      meshRef.current.position.set(gridX * 0.7, 0.15, gridZ * 0.7);
    }
  });

  // Simple stick design: two boxes stacked
  // Top half (round front) = LIGHT color
  // Bottom half (flat back) = DARK color
  // When laid flat (Z rot = PI/2), length runs along X
  // Front up (rotX=0): light side faces up
  // Back up (rotX=PI): dark side faces up
  return (
    <group ref={meshRef} position={[0, 0.3, -0.3]}>
      {/* Top half (LIGHT - front/round side) */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[0.3, 0.16, 1.6]} />
        <meshStandardMaterial color="#E8C887" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Bottom half (DARK - flat side) */}
      <mesh castShadow receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[0.3, 0.16, 1.6]} />
        <meshStandardMaterial color="#2D1810" roughness={0.85} metalness={0.0} />
      </mesh>
    </group>
  );
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[8, 8]} />
      <meshStandardMaterial color="#FAFAF7" roughness={0.9} metalness={0.0} />
    </mesh>
  );
}

// Lighting
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight
        position={[2, 10, 3]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} color="#FFFAF0" />
    </>
  );
}

// Camera controller
function CameraController({ isThrown, onAnimationDone }: { isThrown: boolean; onAnimationDone: () => void }) {
  const { camera } = useThree();
  const startTime = useRef(0);
  const phase = useRef<'throw' | 'rotating' | 'done'>('throw');
  const doneCalled = useRef(false);

  const startCam = useRef(new THREE.Vector3(0, 6, 0.5));
  const endCam = useRef(new THREE.Vector3(0, 4.5, 3.5));

  useEffect(() => {
    if (isThrown) {
      startTime.current = performance.now();
      phase.current = 'throw';
      doneCalled.current = false;
      camera.position.copy(startCam.current);
      camera.lookAt(0, 0, 0);
    }
  }, [isThrown, camera]);

  useFrame(() => {
    if (!isThrown || phase.current === 'done') return;
    const elapsed = (performance.now() - startTime.current) / 1000;
    const throwDuration = 1.2;
    const landDuration = 0.4;
    const waitAfterLand = 0.3;
    const rotateDuration = 1.0;

    if (elapsed < throwDuration + landDuration + waitAfterLand) {
      phase.current = 'throw';
      camera.position.lerp(startCam.current, 0.15);
      camera.lookAt(0, 0, 0);
    } else if (elapsed < throwDuration + landDuration + waitAfterLand + rotateDuration) {
      phase.current = 'rotating';
      const t = (elapsed - throwDuration - landDuration - waitAfterLand) / rotateDuration;
      const easedT = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(startCam.current, endCam.current, easedT);
      camera.lookAt(0, 0.15, 0);
    } else {
      phase.current = 'done';
      camera.position.copy(endCam.current);
      camera.lookAt(0, 0.15, 0);
      if (!doneCalled.current) {
        doneCalled.current = true;
        onAnimationDone();
      }
    }
  });

  return null;
}

// Interactive camera controls
function InteractiveControls({ enabled }: { enabled: boolean }) {
  return (
    <OrbitControls
      enabled={enabled}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={10}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.1}
      target={[0, 0.15, 0]}
      makeDefault
    />
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
      camera={{ position: [0, 6, 0.5], fov: 50 }}
      style={{ width: '100%', height: '100%', background: '#FAFAF7', touchAction: 'none' }}
      gl={{ alpha: false, antialias: true }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#FAFAF7']} />
      <Lighting />
      <SceneContent
        key={isThrown ? 'throwing' : 'idle'}
        isThrown={isThrown}
        throwResult={throwResult}
        onAnimationEnd={onAnimationEnd}
      />
    </Canvas>
  );
}

function SceneContent({ isThrown, throwResult, onAnimationEnd }: YutThrow3DProps) {
  const [cameraAnimationDone, setCameraAnimationDone] = useState(false);

  return (
    <>
      <CameraController
        isThrown={isThrown}
        onAnimationDone={() => setCameraAnimationDone(true)}
      />
      <InteractiveControls enabled={cameraAnimationDone} />
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
    </>
  );
}
