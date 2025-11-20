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
  onPositionChange: (pos: THREE.Vector3) => void;
  onLock: () => void;
  onUnlock: () => void;
}

export const PlayerController: React.FC<PlayerProps> = ({ onPositionChange, onLock, onUnlock }) => {
  const groupRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  const { camera, scene } = useThree();
  const [, get] = useKeyboardControls<Controls>();
  
  const [velocity] = useState(() => new THREE.Vector3());
  const [currentY, setCurrentY] = useState(0);
  
  // Raycaster for terrain height detection
  const raycaster = useRef(new THREE.Raycaster());
  const downVector = useRef(new THREE.Vector3(0, -1, 0));

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Terrain Height Detection
    // Cast a ray from high up downwards at the player's X/Z
    const rayOrigin = groupRef.current.position.clone();
    rayOrigin.y = 50; // Start ray from sky
    
    raycaster.current.set(rayOrigin, downVector.current);
    
    // Find terrain in scene
    const terrain = scene.getObjectByName('terrain');
    let targetY = 0;
    
    if (terrain) {
      const intersects = raycaster.current.intersectObject(terrain);
      if (intersects.length > 0) {
        targetY = intersects[0].point.y;
      }
    }

    // Smoothly interpolate Y position to avoid snapping
    // If snapping happens, increase the lerp factor or just set directly if delta is large
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 10 * delta);


    // 2. Camera-Relative Movement
    const { forward, backward, left, right, sprint } = get();
    const speed = sprint ? 12 : 6;
    
    const moveDirection = new THREE.Vector3();
    
    // Get camera direction (projected onto flat ground)
    const cameraForward = new THREE.Vector3();
    camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();
    
    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0));
    
    // Calculate movement vector
    if (forward) moveDirection.add(cameraForward);
    if (backward) moveDirection.sub(cameraForward);
    if (right) moveDirection.add(cameraRight);
    if (left) moveDirection.sub(cameraRight);
    
    if (moveDirection.length() > 0) {
      moveDirection.normalize().multiplyScalar(speed * delta);
      groupRef.current.position.add(moveDirection);
      
      // Rotate character model to face movement direction smoothly
      if (characterRef.current) {
        const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
        // Shortest path rotation interpolation
        let diff = targetRotation - characterRef.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        characterRef.current.rotation.y += diff * 10 * delta;
      }
    }

    // Limit bounds
    if (groupRef.current.position.x > 48) groupRef.current.position.x = 48;
    if (groupRef.current.position.x < -48) groupRef.current.position.x = -48;
    if (groupRef.current.position.z > 48) groupRef.current.position.z = 48;
    if (groupRef.current.position.z < -48) groupRef.current.position.z = -48;

    // Update parent with position
    onPositionChange(groupRef.current.position.clone());

    // 3. Camera Follow Logic (Third Person - Floating behind)
    // We update camera position to trail the player, but let PointerLock handle rotation
    const offset = new THREE.Vector3(0, 3, 6); // Behind and up
    // We need to apply the camera's current rotation to this offset so it stays "behind" relative to view
    // Actually, standard FPS-style control with orbit:
    // If PointerLock rotates camera, forward is camera forward.
    // We want camera to be at PlayerPos.
    // Let's do a simple "Camera follows player position" but stays fixed in relative offset?
    // No, if I look left, camera rotates left.
    // If I just set camera.position = player.position + offset, it acts like an FPS attached to a pole.
    
    // Simple robust TPS: 
    // Camera is strictly at PlayerPosition + Offset(rotated by Y).
    // But we want to look up/down too.
    
    // Let's try a "Free Camera" that follows player.
    // Camera Position = PlayerPosition + (0, 4, 0) (Head height + a bit up)
    // And let the user look around freely (FPS feel).
    // This is best for exploration.
    // We will position the camera slightly *behind* the head so we can see the character?
    // Or just do FPS.
    // Let's do FPS-ish: Camera is slightly above player.
    
    const cameraTargetPos = groupRef.current.position.clone().add(new THREE.Vector3(0, 2.5, 0));
    // We just set the position, rotation is handled by PointerLock
    state.camera.position.copy(cameraTargetPos);
    
    // If we want to see the player, we need to offset backwards relative to camera rotation
    const viewDir = new THREE.Vector3();
    state.camera.getWorldDirection(viewDir);
    viewDir.multiplyScalar(-5); // Move back 5 units
    state.camera.position.add(viewDir);
    
  });

  return (
    <>
      <PointerLockControls 
        onLock={onLock} 
        onUnlock={onUnlock}
      />
      
      <group ref={groupRef}>
        {/* Separate character group for rotation independent of "player object" logic if needed */}
        <group ref={characterRef}>
          {/* Player Character Representation */}
          <mesh position={[0, 1, 0]} castShadow>
            <capsuleGeometry args={[0.4, 1, 4, 8]} />
            <meshStandardMaterial color="#f0a500" flatShading />
          </mesh>
          {/* Backpack / Details */}
          <mesh position={[0, 1.2, -0.35]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.3]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Goggles/Eyes indication */}
          <mesh position={[0, 1.6, 0.3]} castShadow>
            <boxGeometry args={[0.5, 0.15, 0.1]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>
      </group>
    </>
  );
};