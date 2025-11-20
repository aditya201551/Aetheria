
import React, { createContext, useContext, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS, LIGHTING } from '../constants';
import { TimeContextType } from '../types';

const GameTimeContext = createContext<TimeContextType | null>(null);

export const useGameTime = () => {
  const context = useContext(GameTimeContext);
  if (!context) throw new Error("useGameTime must be used within a PlanetarySystem");
  return context;
};

export const PlanetarySystem: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const timeRef = useRef(0); 
  
  // Context is still useful for synchronizing pulses (mushrooms/lights)
  const contextValue = useMemo(() => ({
    timeRef,
    isNight: () => true, // Always night in this realm
  }), []);

  return (
    <GameTimeContext.Provider value={contextValue}>
      <MagicalAtmosphere />
      {children}
    </GameTimeContext.Provider>
  );
};

const MagicalAtmosphere: React.FC = () => {
  const { scene } = useThree();
  const { timeRef } = useGameTime();
  
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const moonRef = useRef<THREE.DirectionalLight>(null);
  
  const fogColor = useMemo(() => new THREE.Color(COLORS.fog), []);
  const baseAmbient = new THREE.Color("#1a1040"); // Deep purple ambient
  const peakAmbient = new THREE.Color("#2a4060"); // Blue-ish ambient
  
  useFrame((state, delta) => {
    // 1. Advance Time (Used for pulsing effects, not sun rotation)
    timeRef.current = (timeRef.current + delta * 0.1) % (Math.PI * 2);
    const t = timeRef.current;

    // 2. Ambient Light "Breathing"
    if (ambientRef.current) {
        // Smoothly shift ambient intensity and slight color tint
        const pulse = (Math.sin(t) + 1) * 0.5; // 0 to 1
        ambientRef.current.intensity = THREE.MathUtils.lerp(LIGHTING.ambientBase, LIGHTING.ambientPeak, pulse);
        
        // Subtle color shift between purple and blue
        ambientRef.current.color.lerpColors(baseAmbient, peakAmbient, pulse);
    }

    // 3. Moon Movement (Very slow drift)
    if (moonRef.current) {
        const moonAngle = state.clock.getElapsedTime() * 0.02;
        moonRef.current.position.x = Math.cos(moonAngle) * 50;
        moonRef.current.position.z = Math.sin(moonAngle) * 50;
        moonRef.current.lookAt(0, 0, 0);
    }
    
    // 4. Scene Background
    scene.background = fogColor;
    if (scene.fog) scene.fog.color.copy(fogColor);
  });

  return (
    <>
      {/* Main Light Source: The Moon */}
      <directionalLight
        ref={moonRef}
        position={[50, 50, 20]}
        intensity={LIGHTING.moonIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        color="#a0c0ff" // Cool blue moonlight
      >
        <orthographicCamera attach="shadow-camera" args={[-60, 60, 60, -60]} />
      </directionalLight>
      
      {/* Shifting Magical Ambient Light */}
      <ambientLight ref={ambientRef} intensity={0.3} />

      {/* Permanent Stars */}
      <Stars radius={90} depth={50} count={8000} factor={5} saturation={0.5} fade speed={0.5} />

      {/* Distant Low Clouds for atmosphere */}
      <Cloud 
        opacity={0.3} 
        speed={0.2} 
        bounds={[100, 2, 10]} 
        segments={10} 
        position={[0, 30, -50]} 
        color="#2a1050"
      />
    </>
  );
};
