
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RemotePlayer as RemotePlayerType } from '../types';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';

export const RemotePlayer: React.FC<{ data: RemotePlayerType }> = ({ data }) => {
  const ref = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(...data.position));
  const targetRot = useRef(data.rotation);

  // Update targets when data changes - using useEffect to avoid side-effects during render
  useEffect(() => {
    targetPos.current.set(...data.position);
    targetRot.current = data.rotation;
  }, [data.position, data.rotation]);

  useFrame((state, delta) => {
    if (ref.current) {
        // Linear interpolation for smooth network movement (Client-side interpolation)
        ref.current.position.lerp(targetPos.current, 10 * delta);
        
        // Smooth rotation (shortest path)
        let diff = targetRot.current - ref.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        ref.current.rotation.y += diff * 10 * delta;
    }
  });

  return (
    <group ref={ref} position={data.position}>
       {/* Name Tag */}
       <Billboard position={[0, 2.2, 0]}>
         <Text 
            fontSize={0.3} 
            color="#00bcd4" 
            anchorX="center" 
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
         >
           Traveler
         </Text>
       </Billboard>

       {/* Avatar Mesh - distinct color (Cyan) for remote players */}
       <group>
          <mesh position={[0, 1, 0]} castShadow>
            <capsuleGeometry args={[0.4, 1, 4, 8]} />
            <meshStandardMaterial color="#00bcd4" flatShading />
          </mesh>
          <mesh position={[0, 1.2, -0.35]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.3]} />
            <meshStandardMaterial color="#37474f" />
          </mesh>
          <mesh position={[0, 1.6, 0.3]} castShadow>
            <boxGeometry args={[0.5, 0.15, 0.1]} />
            <meshStandardMaterial color="#222" />
          </mesh>
       </group>
    </group>
  );
};
