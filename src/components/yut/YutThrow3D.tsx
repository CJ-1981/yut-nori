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
  onStickSettled?: (index: number, isTopUp: boolean) => void;
}

function PhysicsYutStick({ index, throwResult, isThrown, onAnimationEnd, onStickSettled }: PhysicsYutStickProps) {
  const rigidBodyRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hasSettled, setHasSettled] = useState(false);
  const [collisionSoundPlayed, setCollisionSoundPlayed] = useState(false);
  const settleTimerRef = useRef(0);
  const endCalledRef = useRef(false);
  const initializedRef = useRef(false);
  const settledReportedRef = useRef(false);
  const hasSettledRef = useRef(false);
  const throwStartTimeRef = useRef(0);
  const maxWaitTime = 10.0;

  // Random initial throw parameters per stick - spread out starting positions
  const throwParams = useMemo(() => {
    const gridX = (index % 2) * 2 - 1;
    const gridZ = Math.floor(index / 2) * 2 - 1;
    return {
      startX: gridX * 0.9 + (Math.random() - 0.5) * 0.2,
      startZ: gridZ * 0.9 + (Math.random() - 0.5) * 0.2,
      velX: (Math.random() - 0.5) * 1.5,
      velY: 5 + Math.random() * 3,
      velZ: (Math.random() - 0.5) * 1.5,
      angVelX: 10 + Math.random() * 8, // very strong flip
      angVelY: (Math.random() - 0.5) * 5,
      angVelZ: (Math.random() - 0.5) * 6,
    };
  }, []);

  useEffect(() => {
    if (!isThrown) return;
    let attempts = 0;
    const tryInit = () => {
      if (rigidBodyRef.current && !initializedRef.current) {
        const rb = rigidBodyRef.current;
        initializedRef.current = true;
        rb.setTranslation({ x: throwParams.startX, y: 3.5, z: throwParams.startZ }, true);
        // Random initial rotation
        const initRotX = Math.random() * Math.PI * 2;
        const initRotY = Math.random() * Math.PI * 2;
        const initRotZ = Math.random() * Math.PI * 2;
        const initQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(initRotX, initRotY, initRotZ));
        rb.setRotation({ x: initQuat.x, y: initQuat.y, z: initQuat.z, w: initQuat.w }, true);
        rb.setLinvel({ x: throwParams.velX, y: throwParams.velY, z: throwParams.velZ }, true);
        rb.setAngvel({ x: throwParams.angVelX, y: throwParams.angVelY, z: throwParams.angVelZ }, true);
        setHasSettled(false);
        setCollisionSoundPlayed(false);
        endCalledRef.current = false;
        settledReportedRef.current = false;
        settleTimerRef.current = 0;
        hasSettledRef.current = false;
        throwStartTimeRef.current = performance.now();
      } else if (attempts < 20) {
        attempts++;
        setTimeout(tryInit, 50);
      }
    };
    tryInit();
  }, [isThrown, throwParams]);

  // Monitor settling and play sounds
  useFrame(() => {
    if (!isThrown || !rigidBodyRef.current || hasSettledRef.current || !initializedRef.current) return;

    const rb = rigidBodyRef.current;
    const translation = rb.translation();
    const linvel = rb.linvel();
    const angvel = rb.angvel();

    const speed = Math.sqrt(linvel.x ** 2 + linvel.y ** 2 + linvel.z ** 2);
    const angSpeed = Math.sqrt(angvel.x ** 2 + angvel.y ** 2 + angvel.z ** 2);

    if (!collisionSoundPlayed && translation.y < 0.3 && speed > 1) {
      setCollisionSoundPlayed(true);
      soundManager.play('stickLand');
    }

    if (translation.y < 0) {
      rb.setTranslation({ x: translation.x, y: 0.08, z: translation.z }, true);
      rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    const elapsed = (performance.now() - throwStartTimeRef.current) / 1000;
    if (elapsed < 2.0) return;

    // Each stick must be individually stopped before reporting
    const isSlowEnough = speed < 0.05 && angSpeed < 0.05;
    const isLowEnough = translation.y < 0.5;
    const isTimeout = elapsed > maxWaitTime;

    if ((isSlowEnough && isLowEnough) || isTimeout) {
      settleTimerRef.current += 1;
      // Wait 60 frames (~1s) of being consistently stopped
      if ((settleTimerRef.current > 60 || isTimeout) && !hasSettledRef.current) {
        // Mark settled FIRST to prevent any re-entry
        hasSettledRef.current = true;

        // Measure orientation using RigidBody rotation BEFORE disabling
        const rot = rb.rotation();
        const rbQuat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
        const localUp = new THREE.Vector3(0, 1, 0);
        const worldUp = localUp.applyQuaternion(rbQuat);
        // D-shape round top is at +Y in local space
        // y > 0 = round top up, y < 0 = flat bottom up
        // |y| < 0.3 = on edge, judge as top up (favorable)
        const isTopUp = worldUp.y >= -0.3;

        // No forced correction - let physics determine final orientation
        // The D-shape collider naturally prevents stable 45-degree resting

        // Report result using measured value (before any correction side effects)
        if (!settledReportedRef.current) {
          settledReportedRef.current = true;
          onStickSettled?.(index, isTopUp);
        }

        // Stop physics AFTER reporting
        rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rb.setEnabled(false);

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

  // Stick: half-cylinder (D-shape) using ExtrudeGeometry
  const isBackDoStick = throwResult?.result === 'back-do' && throwResult.backDoIndex === index;
  const bottomColor = isBackDoStick ? '#DC2626' : '#5C3A1A';

  // Create D-shape (half-circle) cross-section using THREE.Shape
  // Arc from 0 to PI with clockwise=false goes counter-clockwise: +X → +Y → -X (top half)
  const halfCylinderGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 0.15;
    shape.moveTo(-radius, 0);
    shape.lineTo(radius, 0);
    // absarc(0, 0, r, 0, PI, false): 0→PI counter-clockwise = +X → +Y → -X (top half)
    shape.absarc(0, 0, radius, 0, Math.PI, false);
    shape.lineTo(-radius, 0);
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 1.6,
      bevelEnabled: false,
      steps: 1,
    });
    geom.translate(0, 0, -0.8);
    return geom;
  }, []);

  const endCapGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 0.15;
    shape.moveTo(-radius, 0);
    shape.lineTo(radius, 0);
    shape.absarc(0, 0, radius, 0, Math.PI, false);
    shape.lineTo(-radius, 0);
    return new THREE.ShapeGeometry(shape);
  }, []);

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      position={[throwParams.startX, 3.5, throwParams.startZ]}
      restitution={0.0}
      friction={1.0}
      linearDamping={0.5}
      angularDamping={0.3}
    >
      {/* Collider: matches D-shape, flat bottom prevents 45-degree resting */}
      <CuboidCollider args={[0.14, 0.075, 0.78]} position={[0, 0.075, 0]} />

      {/* Half-cylinder mesh (light bamboo) - round top */}
      <mesh ref={meshRef} castShadow receiveShadow geometry={halfCylinderGeometry}>
        <meshStandardMaterial color="#E8C887" roughness={0.5} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Flat bottom (brown or red) */}
      <mesh castShadow receiveShadow position={[0, -0.001, 0]}>
        <boxGeometry args={[0.3, 0.02, 1.6]} />
        <meshStandardMaterial color={bottomColor} roughness={0.85} metalness={0.0} />
      </mesh>

      {/* End caps (D-shape) */}
      <mesh geometry={endCapGeometry} position={[0, 0, 0.8]}>
        <meshStandardMaterial color="#D4A856" roughness={0.5} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={endCapGeometry} position={[0, 0, -0.8]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial color="#D4A856" roughness={0.5} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Markings on top */}
      <mesh position={[0, 0.15, 0.5]} castShadow>
        <boxGeometry args={[0.12, 0.01, 0.03]} />
        <meshStandardMaterial color="#3D2410" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.15, -0.5]} castShadow>
        <boxGeometry args={[0.12, 0.01, 0.03]} />
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
    const throwPhaseDuration = 5.0;
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
function InteractiveControls({ enabled, onUserInteraction }: { enabled: boolean; onUserInteraction?: (interacting: boolean) => void }) {
  const controlsRef = useRef<any>(null);

  return (
    <OrbitControls
      ref={controlsRef}
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
      onStart={() => onUserInteraction?.(true)}
      onEnd={() => onUserInteraction?.(false)}
    />
  );
}

interface YutThrow3DProps {
  isThrown: boolean;
  throwResult: YutThrow | null;
  onAnimationEnd: () => void;
  onUserInteraction?: (interacting: boolean) => void;
  onActualResult?: (sticks: boolean[]) => void;
}

export function YutThrow3D({ isThrown, throwResult, onAnimationEnd, onUserInteraction, onActualResult }: YutThrow3DProps) {
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
        onUserInteraction={onUserInteraction}
        onActualResult={onActualResult}
      />
    </Canvas>
  );
}

function SceneContent({ isThrown, throwResult, onAnimationEnd, onUserInteraction, onActualResult }: YutThrow3DProps) {
  const [cameraAnimationDone, setCameraAnimationDone] = useState(false);
  // Use null for "not yet settled" - MUST be null, not false!
  const settledResultsRef = useRef<(boolean | null)[]>([null, null, null, null]);
  const reportedRef = useRef(false);
  const settledCountRef = useRef(0);

  const handleStickSettled = (index: number, isTopUp: boolean) => {
    if (settledResultsRef.current[index] !== null) return; // already settled
    settledResultsRef.current[index] = isTopUp;
    settledCountRef.current += 1;
    // Check if ALL 4 sticks have settled
    if (settledCountRef.current >= 4 && !reportedRef.current) {
      reportedRef.current = true;
      onActualResult?.(settledResultsRef.current.map((v) => v === true));
    }
  };

  // Reset on new throw
  useEffect(() => {
    if (isThrown) {
      settledResultsRef.current = [null, null, null, null];
      reportedRef.current = false;
      settledCountRef.current = 0;
    }
  }, [isThrown]);

  return (
    <>
      <CameraController
        isThrown={isThrown}
        onAnimationDone={() => setCameraAnimationDone(true)}
      />
      <InteractiveControls enabled={cameraAnimationDone} onUserInteraction={onUserInteraction} />
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
            onStickSettled={handleStickSettled}
          />
        ))}
      </Physics>
    </>
  );
}
