import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';
import { COLORS, WORLD_SIZE } from '../constants';
import { PointOfInterest } from '../types';

// Procedural Terrain Component
export const Terrain: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, colors } = useMemo(() => {
    const geom = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 60, 60); // Increased resolution for smoother movement
    const pos = geom.attributes.position;
    const count = pos.count;
    const colorsArr = [];
    
    // Simple noise-like displacement
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Simple math noise
      const z = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2 + Math.random() * 0.5;
      pos.setZ(i, z);
      
      // Vertex coloring based on height
      if (z > 1.5) {
        colorsArr.push(0.9, 0.9, 0.9); // Snow/Rock top
      } else if (z < -0.5) {
        colorsArr.push(0.2, 0.5, 0.8); // Water levelish
      } else {
        colorsArr.push(0.4, 0.8, 0.4); // Grass
      }
    }
    
    geom.computeVertexNormals();
    const colorAttr = new THREE.Float32BufferAttribute(colorsArr, 3);
    geom.setAttribute('color', colorAttr);

    return { geometry: geom, colors: colorAttr };
  }, []);

  return (
    <mesh 
      ref={meshRef} 
      name="terrain"
      rotation={[-Math.PI / 2, 0, 0]} 
      receiveShadow
    >
      <primitive object={geometry} />
      <meshStandardMaterial 
        vertexColors 
        flatShading 
        roughness={0.8} 
        metalness={0.1} 
      />
    </mesh>
  );
};

// Procedural Tree
const Tree: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const scale = useMemo(() => 0.8 + Math.random() * 0.6, []);
  const color = useMemo(() => COLORS.treeLeaves[Math.floor(Math.random() * COLORS.treeLeaves.length)], []);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 2, 6]} />
        <meshStandardMaterial color={COLORS.treeTrunk} flatShading />
      </mesh>
      {/* Leaves */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
};

// Crystal Shard (POI)
const Crystal: React.FC = () => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh castShadow>
        <octahedronGeometry args={[0.8, 0]} />
        <meshPhysicalMaterial 
          color={COLORS.crystal} 
          emissive={COLORS.crystal}
          emissiveIntensity={0.5}
          transmission={0.6}
          thickness={1}
          roughness={0}
          flatShading
        />
      </mesh>
    </Float>
  );
};

const Ruin: React.FC = () => (
  <group>
    <mesh position={[0, 1.5, 0]} castShadow>
      <boxGeometry args={[1, 3, 1]} />
      <meshStandardMaterial color={COLORS.rock} flatShading />
    </mesh>
    <mesh position={[1.5, 0.5, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
      <boxGeometry args={[0.8, 1.5, 0.8]} />
      <meshStandardMaterial color={COLORS.rock} flatShading />
    </mesh>
  </group>
);

interface WorldProps {
  pois: PointOfInterest[];
}

export const WorldObjects: React.FC<WorldProps> = ({ pois }) => {
  // Generate static trees only once
  const trees = useMemo(() => {
    const tempTrees = [];
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
      const z = (Math.random() - 0.5) * WORLD_SIZE * 0.8;
      if (Math.abs(x) > 5 || Math.abs(z) > 5) { // Don't spawn on 0,0
        tempTrees.push({ position: [x, 0, z] as [number, number, number], id: i });
      }
    }
    return tempTrees;
  }, []);

  return (
    <group>
      {trees.map((tree) => (
        <Tree key={tree.id} position={tree.position} />
      ))}
      
      {pois.map((poi) => (
        <group key={poi.id} position={poi.position}>
          {poi.type === 'crystal' && <Crystal />}
          {poi.type === 'ruin' && <Ruin />}
          {poi.type === 'monolith' && <mesh position={[0,2,0]}><boxGeometry args={[1,4,1]} /><meshStandardMaterial color="#444" flatShading /></mesh>}
          {poi.type === 'tree' && <Tree position={[0,0,0]} />}
          
          {/* Beacon to show location if far away */}
          {!poi.isDiscovered && (
            <mesh position={[0, 8, 0]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial color="gold" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};