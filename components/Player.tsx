import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useKeyboardControls, PointerLockControls } from '@react-three/drei';

export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  sprint = 'sprint',
  interact = 'interact',
}

interface PlayerProps {
  onMove: (pos: THREE.Vector3, rotation: number) => void;
  onLock: () => void;
  onUnlock: () => void;
}

export const PlayerController: React.FC<PlayerProps> = ({ onMove, onLock, onUnlock }) => {
  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  const { camera, scene } = useThree();
  const [, get] = useKeyboardControls<Controls>();
  
  // Raycaster for terrain height detection
  const raycaster = useRef(new THREE.Raycaster());
  const downVector = useRef(new THREE.Vector3(0, -1, 0));

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Terrain Height Detection
    const rayOrigin = groupRef.current.position.clone();
    rayOrigin.y = 50;
    
    raycaster.current.set(rayOrigin, downVector.current);
    
    const terrain = scene.getObjectByName('terrain');
    let targetY = 0;
    
    if (terrain) {
      const intersects = raycaster.current.intersectObject(terrain);
      if (intersects.length > 0) {
        targetY = intersects[0].point.y;
      }
    }

    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 10 * delta);

    // 2. Movement
    const { forward, backward, left, right, sprint } = get();
    const speed = sprint ? 12 : 6;
    
    const moveDirection = new THREE.Vector3();
    
    // Get camera direction
    const cameraForward = new THREE.Vector3();
    camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();
    
    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0));
    
    if (forward) moveDirection.add(cameraForward);
    if (backward) moveDirection.sub(cameraForward);
    if (right) moveDirection.add(cameraRight);
    if (left) moveDirection.sub(cameraRight);
    
    let currentRotation = 0;

    if (moveDirection.length() > 0) {
      moveDirection.normalize().multiplyScalar(speed * delta);
      groupRef.current.position.add(moveDirection);
      
      // Rotate character model
      if (characterRef.current) {
        const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
        let diff = targetRotation - characterRef.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        characterRef.current.rotation.y += diff * 10 * delta;
        currentRotation = characterRef.current.rotation.y;
      }
    } else if (characterRef.current) {
        // Keep existing rotation if not moving
        currentRotation = characterRef.current.rotation.y;
    }

    // Bounds
    const bound = 48;
    if (groupRef.current.position.x > bound) groupRef.current.position.x = bound;
    if (groupRef.current.position.x < -bound) groupRef.current.position.x = -bound;
    if (groupRef.current.position.z > bound) groupRef.current.position.z = bound;
    if (groupRef.current.position.z < -bound) groupRef.current.position.z = -bound;

    // Broadcast move
    onMove(groupRef.current.position.clone(), currentRotation);

    // 3. Camera
    const cameraTargetPos = groupRef.current.position.clone().add(new THREE.Vector3(0, 2.5, 0));
    state.camera.position.copy(cameraTargetPos);
    
    const viewDir = new THREE.Vector3();
    state.camera.getWorldDirection(viewDir);
    viewDir.multiplyScalar(-5);
    state.camera.position.add(viewDir);
  });

  return (
    <>
      <PointerLockControls 
        onLock={onLock} 
        onUnlock={onUnlock}
      />
      
      <group ref={groupRef}>
        <group ref={characterRef}>
          {/* Player Character Representation */}
          <mesh position={[0, 1, 0]} castShadow>
            <capsuleGeometry args={[0.4, 1, 4, 8]} />
            <meshStandardMaterial color="#f0a500" flatShading />
          </mesh>
          <mesh position={[0, 1.2, -0.35]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.3]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 1.6, 0.3]} castShadow>
            <boxGeometry args={[0.5, 0.15, 0.1]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      </group>
    </>
  );
};
