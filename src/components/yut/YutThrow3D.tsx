'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { YutThrow } from '@/lib/game/types';
import { soundManager } from '@/lib/sound/sounds';

// Physical yut stick with physics simulation
interface PhysicsYutStickProps {
  index: number;
  throwResult: YutThrow | null;
  isThrown: boolean;
  onAnimationEnd: () => void;
}

function PhysicsYutStick({ index, throwResult, isThrown, onAnimationEnd }: PhysicsYutStickProps) {
  const rigidBodyRef = useRef<any>(null);
  const [hasSettled, setHasSettled] = useState(false);
  const [collisionSoundPlayed, setCollisionSoundPlayed] = useState(false);
  const settleTimerRef = useRef(0);
  const endCalledRef = useRef(false);
  const initializedRef = useRef(false);

  // Random initial throw parameters per stick - spread out starting positions
  const throwParams = useMemo(() => {
    // Spread sticks in a 2x2 grid pattern with random offset
    const gridX = (index % 2) * 2 - 1; // -1 or 1
    const gridZ = Math.floor(index / 2) * 2 - 1; // -1 or 1
    return {
      startX: gridX * 0.6 + (Math.random() - 0.5) * 0.2,
      startZ: gridZ * 0.6 + (Math.random() - 0.5) * 0.2,
      // Drop from above with slight random velocity
      velX: (Math.random() - 0.5) * 1,
      velY: 2 + Math.random() * 1,
      velZ: (Math.random() - 0.5) * 1,
      angVelX: (Math.random() - 0.5) * 8,
      angVelY: (Math.random() - 0.5) * 6,
      angVelZ: (Math.random() - 0.5) * 8,
    };
  }, []);

  // Apply throw impulse after physics body is ready
  useEffect(() => {
    if (!isThrown) return;

    let attempts = 0;
    const tryInit = () => {
      if (rigidBodyRef.current && !initializedRef.current) {
        const rb = rigidBodyRef.current;
        initializedRef.current = true;
        // Drop sticks from height with random rotation
        rb.setTranslation({ x: throwParams.startX, y: 2.0, z: throwParams.startZ }, true);
        rb.setLinvel({ x: throwParams.velX, y: throwParams.velY, z: throwParams.velZ }, true);
        rb.setAngvel({ x: throwParams.angVelX, y: throwParams.angVelY, z: throwParams.angVelZ }, true);
        setHasSettled(false);
        setCollisionSoundPlayed(false);
        endCalledRef.current = false;
      } else if (attempts < 20) {
        attempts++;
        setTimeout(tryInit, 50);
      }
    };
    tryInit();
  }, [isThrown, throwParams]);

  // Monitor settling and play sounds
  useFrame(() => {
    if (!isThrown || !rigidBodyRef.current || hasSettled || !initializedRef.current) return;

    const rb = rigidBodyRef.current;
    const translation = rb.translation();
    const linvel = rb.linvel();
    const angvel = rb.angvel();

    const speed = Math.sqrt(linvel.x ** 2 + linvel.y ** 2 + linvel.z ** 2);
    const angSpeed = Math.sqrt(angvel.x ** 2 + angvel.y ** 2 + angvel.z ** 2);

    // Play collision sound when stick hits ground
    if (!collisionSoundPlayed && translation.y < 0.3 && speed > 1) {
      setCollisionSoundPlayed(true);
      soundManager.play('stickLand');
    }

    // Check if stick has settled
    if (speed < 0.15 && angSpeed < 0.15 && translation.y < 0.25) {
      settleTimerRef.current += 1;
      if (settleTimerRef.current > 30) {
        setHasSettled(true);
        if (!endCalledRef.current) {
          endCalledRef.current = true;
          setTimeout(() => onAnimationEnd(), 500);
        }
      }
    } else {
      settleTimerRef.current = 0;
    }
  });

  // Stick: two boxes (light top, dark bottom) with markings
  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      position={[throwParams.startX, 2.0, throwParams.startZ]}
      restitution={0.3}
      friction={0.8}
      linearDamping={0.1}
      angularDamping={0.3}
    >
      <CuboidCollider args={[0.15, 0.08, 0.8]} />

      {/* Light top half (front/round side) */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[0.3, 0.16, 1.6]} />
        <meshStandardMaterial color="#E8C887" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Dark bottom half (flat side) */}
      <mesh castShadow receiveShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[0.3, 0.16, 1.6]} />
        <meshStandardMaterial color="#2D1810" roughness={0.85} metalness={0.0} />
      </mesh>

      {/* Markings on top (light side) - dark vertical stripes like real yut sticks */}
      <mesh position={[-0.08, 0.17, 0]} castShadow>
        <boxGeometry args={[0.03, 0.01, 1.3]} />
        <meshStandardMaterial color="#3D2410" roughness={0.7} />
      </mesh>
      <mesh position={[0.08, 0.17, 0]} castShadow>
        <boxGeometry args={[0.03, 0.01, 1.3]} />
        <meshStandardMaterial color="#3D2410" roughness={0.7} />
      </mesh>
      {/* Cross markings near ends */}
      <mesh position={[0, 0.17, 0.5]} castShadow>
        <boxGeometry args={[0.25, 0.01, 0.03]} />
        <meshStandardMaterial color="#3D2410" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.17, -0.5]} castShadow>
        <boxGeometry args={[0.25, 0.01, 0.03]} />
        <meshStandardMaterial color="#3D2410" roughness={0.7} />
      </mesh>
    </RigidBody>
  );
}

// Ground plane
function PhysicsGround() {
  return (
    <RigidBody type="fixed" colliders={false} friction={0.8} restitution={0.2}>
      <CuboidCollider args={[4, 0.01, 4]} position={[0, -0.02, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#FAFAF7" roughness={0.9} metalness={0.0} />
      </mesh>
    </RigidBody>
  );
}

// Walls to contain sticks
function PhysicsWalls() {
  const wallHeight = 1.5;
  const wallThickness = 0.1;
  const wallSize = 2.5;
  return (
    <>
      <RigidBody type="fixed" colliders={false} position={[0, wallHeight / 2, -wallSize]}>
        <CuboidCollider args={[wallSize, wallHeight / 2, wallThickness / 2]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[-wallSize, wallHeight / 2, 0]}>
        <CuboidCollider args={[wallThickness / 2, wallHeight / 2, wallSize]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[wallSize, wallHeight / 2, 0]}>
        <CuboidCollider args={[wallThickness / 2, wallHeight / 2, wallSize]} />
      </RigidBody>
      <RigidBody type="fixed" colliders={false} position={[0, wallHeight / 2, wallSize]}>
        <CuboidCollider args={[wallSize, wallHeight / 2, wallThickness / 2]} />
      </RigidBody>
    </>
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
  const phase = useRef<'throw' | 'done'>('throw');
  const doneCalled = useRef(false);

  const startCam = useRef(new THREE.Vector3(0, 9, 2));
  const endCam = useRef(new THREE.Vector3(0, 6, 4.5));

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
    const throwPhaseDuration = 2.5;
    const rotateDuration = 1.0;

    if (elapsed < throwPhaseDuration) {
      phase.current = 'throw';
      camera.position.lerp(startCam.current, 0.15);
      camera.lookAt(0, 0, 0);
    } else if (elapsed < throwPhaseDuration + rotateDuration) {
      const t = (elapsed - throwPhaseDuration) / rotateDuration;
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
      camera={{ position: [0, 9, 2], fov: 60 }}
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
      <Physics gravity={[0, -9.81, 0]} timeStep="vary">
        <PhysicsGround />
        <PhysicsWalls />
        {[0, 1, 2, 3].map((i) => (
          <PhysicsYutStick
            key={i}
            index={i}
            throwResult={throwResult}
            isThrown={isThrown}
            onAnimationEnd={onAnimationEnd}
          />
        ))}
      </Physics>
    </>
  );
}
