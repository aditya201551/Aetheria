
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { COLORS, WORLD_SIZE } from '../constants';
import { PointOfInterest } from '../types';
import { useGameTime } from './PlanetarySystem';

// --- 1. Shared Math for Dynamic Terrain Height ---
const getTerrainHeight = (x: number, z: number) => {
  // Create a flat clearing in the center (radius ~15)
  const dist = Math.sqrt(x * x + z * z);
  const centerFlattening = Math.min(1, Math.max(0, (dist - 12) / 10));

  // Moderated heights further for a grounded, relaxing feel
  const mountain = Math.sin(x * 0.03) * Math.cos(z * 0.03) * 2.5; 
  const hill = Math.sin(x * 0.08 + z * 0.1) * 1.0; 
  const detail = Math.sin(x * 0.3) * Math.cos(z * 0.2) * 0.2;
  
  return (mountain + hill + detail) * centerFlattening;
};

// --- 2. Terrain Component ---
export const Terrain: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, colors } = useMemo(() => {
    // Increased segments to 256 for smoother slope interaction and less visual popping
    const geom = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 256, 256);
    const pos = geom.attributes.position;
    const count = pos.count;
    const colorsArr = [];
    
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); 
      
      const h = getTerrainHeight(x, y);
      pos.setZ(i, h);
      
      // Adjusted color thresholds for lower terrain profile
      if (h > 2.2) {
        colorsArr.push(0.85, 0.9, 1.0); // Snow/Ice peaks
      } else if (h > 0.8) {
        colorsArr.push(0.3, 0.35, 0.4); // High rocky mountain side
      } else if (h < -1.2) {
        colorsArr.push(0.05, 0.02, 0.1); // Deep mystical valley floor
      } else {
        // Dark mossy green with purple undertones for mid-levels
        const noise = Math.random() * 0.05;
        colorsArr.push(0.1 + noise, 0.18 + noise, 0.13 + noise); 
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
        roughness={0.9} 
        metalness={0.1} 
      />
    </mesh>
  );
};

// --- 3. Fantasy Assets (Anchored & Scaled) ---

const PineTree: React.FC<{ position: [number, number, number], scale: number }> = ({ position, scale }) => {
  const color = useMemo(() => COLORS.treeLeaves[Math.floor(Math.random() * COLORS.treeLeaves.length)], []);
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.4, 4.0, 5]} />
        <meshStandardMaterial color={COLORS.treeTrunk} flatShading />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.1, 2.2, 6]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.8, 1.8, 6]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <mesh position={[0, 4.6, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.5, 1.4, 6]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
};

const FantasyTree: React.FC<{ position: [number, number, number], scale: number }> = ({ position, scale }) => {
  const color = useMemo(() => COLORS.fantasyLeaves[Math.floor(Math.random() * COLORS.fantasyLeaves.length)], []);
  
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 1.0, 0]} rotation={[0.05, 0, 0.05]} castShadow>
        <cylinderGeometry args={[0.2, 0.6, 5.0, 5]} />
        <meshStandardMaterial color="#1a1512" flatShading />
      </mesh>
      <mesh position={[0, 4.0, 0]} castShadow>
        <dodecahedronGeometry args={[1.3, 0]} /> 
        <meshStandardMaterial 
            color={color} 
            flatShading 
            emissive={color}
            emissiveIntensity={0.2}
        />
      </mesh>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
         <mesh position={[0.7, 5.0, 0.7]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
         </mesh>
         <mesh position={[-0.7, 3.8, -0.4]}>
            <octahedronGeometry args={[0.15, 0]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
         </mesh>
      </Float>
    </group>
  );
};

const GlowingMushroom: React.FC<{ position: [number, number, number], type: number }> = ({ position, type }) => {
  const { timeRef } = useGameTime();
  const color = COLORS.mushrooms.caps[type % COLORS.mushrooms.caps.length];
  const scale = 0.3 + Math.random() * 0.3; // Smaller mushrooms
  
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  const offset = useMemo(() => Math.random() * 100, []);

  useFrame(() => {
    const t = timeRef.current + offset;
    const pulse = (Math.sin(t * 2) + 1) * 0.5; 
    if (materialRef.current) materialRef.current.emissiveIntensity = 0.5 + (pulse * 1.0); 
    if (lightRef.current) lightRef.current.intensity = 0.5 + (pulse * 1.5);
  });
  
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 1.2, 5]} />
        <meshStandardMaterial color={COLORS.mushrooms.stems} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.4, 6, 4, 0, Math.PI * 2, 0, Math.PI/2]} />
        <meshStandardMaterial 
          ref={materialRef}
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5} 
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.5, 0]} color={color} intensity={1} distance={3} decay={2} />
    </group>
  );
};

const Rock: React.FC<{ position: [number, number, number], scale: number }> = ({ position, scale }) => {
  const color = COLORS.rock[Math.floor(Math.random() * COLORS.rock.length)];
  return (
    <mesh position={[position[0], position[1] - 0.4, position[2]]} rotation={[Math.random(), Math.random(), Math.random()]} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color={color} flatShading roughness={0.9} />
    </mesh>
  );
};

const Crystal: React.FC = () => (
    <Float speed={3} rotationIntensity={1} floatIntensity={1}>
      <mesh castShadow>
        <octahedronGeometry args={[1.0, 0]} />
        <meshPhysicalMaterial 
          color={COLORS.crystal} 
          emissive={COLORS.crystal}
          emissiveIntensity={0.8}
          transmission={0.6}
          thickness={1}
          roughness={0}
          flatShading
        />
      </mesh>
      <pointLight color={COLORS.crystal} intensity={2} distance={8} decay={2} />
    </Float>
);

const Ruin: React.FC = () => (
  <group>
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1.5, 6, 1.5]} />
      <meshStandardMaterial color="#263238" flatShading />
    </mesh>
    <mesh position={[2, 0.5, 0]} rotation={[0, 0, Math.PI / 5]} castShadow>
      <boxGeometry args={[1, 2.5, 1]} />
      <meshStandardMaterial color="#263238" flatShading />
    </mesh>
    <mesh position={[-1.5, 0.2, 1.5]} rotation={[0.2, 0.2, 0]} castShadow>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="#263238" flatShading />
    </mesh>
  </group>
);

// --- 4. Atmospheric Particles ---

const Fireflies: React.FC = () => {
  const { timeRef } = useGameTime();
  const count = 150;
  const meshRef = useRef<THREE.Points>(null);

  const [initialPositions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * (WORLD_SIZE / 2 - 5);
      const theta = Math.random() * Math.PI * 2;
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      
      const terrainH = getTerrainHeight(x, z);
      const y = terrainH + 0.5 + Math.random() * 2.0;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, []);

  const currentPositions = useMemo(() => new Float32Array(initialPositions), [initialPositions]);

  useFrame(() => {
    if (!meshRef.current) return;
    const t = timeRef.current;

    for (let i = 0; i < count; i++) {
      const ix = initialPositions[i * 3];
      const iy = initialPositions[i * 3 + 1];
      const iz = initialPositions[i * 3 + 2];
      const p = phases[i];

      const driftX = Math.sin(t * 0.5 + p) * 0.8; 
      const driftY = Math.sin(t * 1.0 + p) * 0.4; 
      const driftZ = Math.cos(t * 0.3 + p) * 0.8;

      currentPositions[i * 3] = ix + driftX;
      currentPositions[i * 3 + 1] = iy + driftY;
      currentPositions[i * 3 + 2] = iz + driftZ;
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count} 
          array={currentPositions} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial 
        color="#d4ff00"
        size={0.12} 
        transparent 
        opacity={0.8} 
        sizeAttenuation={true} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </points>
  );
};

// --- 5. World Population Logic ---

interface WorldProps {
  pois: PointOfInterest[];
}

export const WorldObjects: React.FC<WorldProps> = ({ pois }) => {
  const objects = useMemo(() => {
    const items = [];
    const count = 200;

    for (let i = 0; i < count; i++) {
      const r = 8 + Math.random() * (WORLD_SIZE / 2 - 8); 
      const theta = Math.random() * Math.PI * 2;
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);

      if (Math.sqrt(x * x + z * z) < 15) continue;
      
      const y = getTerrainHeight(x, z) - 0.4; 
      
      const rand = Math.random();
      let type: 'pine' | 'fantasy' | 'mushroom' | 'rock' = 'pine';
      
      if (y > 2.0) { 
        type = rand > 0.7 ? 'pine' : 'rock';
      } else if (y < -0.8) {
        type = rand > 0.6 ? 'mushroom' : (rand > 0.3 ? 'fantasy' : 'rock');
      } else {
        if (rand > 0.85) type = 'fantasy';
        else if (rand > 0.75) type = 'mushroom';
        else if (rand > 0.50) type = 'rock';
        else type = 'pine';
      }

      items.push({ id: i, position: [x, y, z] as [number, number, number], type });
    }
    return items;
  }, []);

  return (
    <group>
      <Fireflies />

      {objects.map((obj) => {
        if (obj.type === 'pine') return <PineTree key={obj.id} position={obj.position} scale={0.5 + Math.random() * 0.5} />;
        if (obj.type === 'fantasy') return <FantasyTree key={obj.id} position={obj.position} scale={0.5 + Math.random() * 0.5} />;
        if (obj.type === 'mushroom') return <GlowingMushroom key={obj.id} position={obj.position} type={obj.id} />;
        if (obj.type === 'rock') return <Rock key={obj.id} position={obj.position} scale={0.3 + Math.random() * 0.4} />;
        return null;
      })}
      
      {pois.map((poi) => {
         const y = getTerrainHeight(poi.position[0], poi.position[2]) - 0.5;
         const adjustedPos: [number, number, number] = [poi.position[0], y, poi.position[2]];

         // userData used for raycasting interaction
         return (
          <group key={poi.id} position={adjustedPos} userData={{ isPoi: true, id: poi.id }}>
            <group>
                {poi.type === 'crystal' && <group position={[0, 1, 0]}><Crystal /></group>}
                {poi.type === 'ruin' && <Ruin />}
                {poi.type === 'monolith' && <mesh position={[0,2.5,0]}><boxGeometry args={[1.2,5,1.2]} /><meshStandardMaterial color="#101010" flatShading /></mesh>}
                {poi.type === 'tree' && <FantasyTree position={[0,0,0]} scale={1.5} />}
            </group>
            
            {/* Invisible hitbox for easier raycasting */}
            <mesh visible={false} position={[0, 2, 0]}>
               <cylinderGeometry args={[2, 2, 6, 8]} />
               <meshBasicMaterial />
            </mesh>

            {!poi.isDiscovered && (
              <mesh position={[0, 8, 0]}>
                <sphereGeometry args={[0.4, 8, 8]} />
                <meshBasicMaterial color="#00e5ff" toneMapped={false} />
                <pointLight color="#00e5ff" intensity={2} distance={20} />
              </mesh>
            )}
          </group>
         );
      })}
    </group>
  );
};
