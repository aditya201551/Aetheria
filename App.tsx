
import React, { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { SoftShadows, KeyboardControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { PointOfInterest, GameState, RemotePlayer as RemotePlayerType } from './types';
import { COLORS } from './constants';
import { generateLore, generateLandmarkName } from './services/geminiService';
import { PlayerController, Controls } from './components/Player';
import { Terrain, WorldObjects } from './components/World';
import { UIOverlay } from './components/UIOverlay';
import { useMultiplayer } from './hooks/useMultiplayer';
import { RemotePlayer } from './components/RemotePlayer';
import { PlanetarySystem } from './components/PlanetarySystem';

// Initial POI setup
const INITIAL_POIS: PointOfInterest[] = [
  { id: '1', position: [15, 0, 15], type: 'ruin', name: 'Unknown Ruin', isDiscovered: false },
  { id: '2', position: [-20, 0, 10], type: 'crystal', name: 'Shimmering Shard', isDiscovered: false },
  { id: '3', position: [5, 0, -25], type: 'monolith', name: 'Silent Stone', isDiscovered: false },
  { id: '4', position: [-15, 0, -15], type: 'tree', name: 'Elder Tree', isDiscovered: false },
];

const GameLogic: React.FC<{ onInteract: () => void }> = ({ onInteract }) => {
  const [sub] = useKeyboardControls<Controls>();
  
  useEffect(() => {
    return sub(
      (state) => state.interact,
      (pressed) => {
        if (pressed) onInteract();
      }
    );
  }, [sub, onInteract]);

  return null;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    isGeneratingLore: false,
    nearbyPoi: null,
    pois: INITIAL_POIS,
  });

  const [showLore, setShowLore] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [hoveredPoiId, setHoveredPoiId] = useState<string | null>(null);

  // Multiplayer Hook
  const { otherPlayers, updateMyPosition } = useMultiplayer();

  // Initialize POI names with AI on load
  useEffect(() => {
    const initNames = async () => {
      const updated = await Promise.all(INITIAL_POIS.map(async (poi) => {
        const name = await generateLandmarkName(poi.type);
        return { ...poi, name };
      }));
      setGameState(prev => ({ ...prev, pois: updated }));
    };
    initNames();
  }, []);

  // Close Lore panel if player walks away from the current POI
  useEffect(() => {
    if (!gameState.nearbyPoi) {
      setShowLore(false);
    }
  }, [gameState.nearbyPoi?.id]);

  const handlePlayerMove = useCallback((playerPos: THREE.Vector3, rotation: number) => {
    updateMyPosition(playerPos, rotation);

    let found: PointOfInterest | null = null;
    
    // Simple proximity check for POIs (distance < 12)
    for (const poi of gameState.pois) {
      const poiPos = new THREE.Vector3(...poi.position);
      const dist = Math.sqrt(Math.pow(playerPos.x - poiPos.x, 2) + Math.pow(playerPos.z - poiPos.z, 2));
      
      if (dist < 12) { 
        found = poi;
        break;
      }
    }

    setGameState(prev => {
        if (prev.nearbyPoi?.id === found?.id) return prev;
        return { ...prev, nearbyPoi: found };
    });
  }, [gameState.pois, updateMyPosition]);

  const handleLookAt = useCallback((id: string | null) => {
     setHoveredPoiId(id);
  }, []);

  const handleInteract = useCallback(async () => {
    const poi = gameState.nearbyPoi;

    // Interaction condition: Must be nearby AND looking at the object
    // Exception: If the lore box is already open, pressing E usually closes it, handled by UIOverlay.
    // But for triggering NEW interaction, we need focus.
    if (!poi) return;
    if (hoveredPoiId !== poi.id) return;

    // If already discovered, just toggle the UI visibility
    if (poi.isDiscovered) {
        setShowLore(prev => !prev);
        return;
    }

    // If currently generating, ignore
    if (gameState.isGeneratingLore) return;

    // Set generating state
    setGameState(prev => ({ ...prev, isGeneratingLore: true }));

    // Start Generation
    generateLore(poi.name, poi.type).then(description => {
            // Fix: Side effects (setShowLore) should not be inside the setGameState updater
            setShowLore(true);

            setGameState(prev => {
            const updatedPois = prev.pois.map(p => 
                p.id === poi.id ? { ...p, description, isDiscovered: true } : p
            );
            
            // Update nearbyPoi if it is still the same one
            const updatedNearby = prev.nearbyPoi?.id === poi.id 
                ? { ...prev.nearbyPoi, description, isDiscovered: true } 
                : prev.nearbyPoi;

            return {
                ...prev,
                pois: updatedPois,
                nearbyPoi: updatedNearby,
                isGeneratingLore: false,
            };
        });
    }).catch(() => {
         setGameState(prev => ({ ...prev, isGeneratingLore: false }));
    });
  }, [gameState, hoveredPoiId]);

  return (
    <div className="w-full h-screen bg-gray-900 font-sans selection:bg-cyan-500 selection:text-white">
      <KeyboardControls
        map={[
          { name: Controls.forward, keys: ['ArrowUp', 'w', 'W'] },
          { name: Controls.backward, keys: ['ArrowDown', 's', 'S'] },
          { name: Controls.left, keys: ['ArrowLeft', 'a', 'A'] },
          { name: Controls.right, keys: ['ArrowRight', 'd', 'D'] },
          { name: Controls.sprint, keys: ['Shift'] },
          { name: Controls.interact, keys: ['e', 'E', 'Enter'] },
        ]}
      >
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
          <PlanetarySystem>
              <fog attach="fog" args={[COLORS.fog, 10, 60]} />
              <SoftShadows size={15} focus={0.5} samples={10} />

              <Terrain />
              <WorldObjects pois={gameState.pois} />
              
              {(Object.values(otherPlayers || {}) as RemotePlayerType[]).map((player: RemotePlayerType) => (
                <RemotePlayer key={player.id} data={player} />
              ))}

              <PlayerController 
                onMove={handlePlayerMove} 
                onLock={() => setIsLocked(true)}
                onUnlock={() => setIsLocked(false)}
                onLookAt={handleLookAt}
              />
              
              <GameLogic onInteract={handleInteract} />
          </PlanetarySystem>
        </Canvas>
        
        <UIOverlay 
          nearbyPoi={gameState.nearbyPoi}
          isGenerating={gameState.isGeneratingLore}
          onInteract={handleInteract}
          isLocked={isLocked}
          showLore={showLore}
          onCloseLore={() => setShowLore(false)}
          isHoveringInteractable={gameState.nearbyPoi?.id === hoveredPoiId}
        />
      </KeyboardControls>
    </div>
  );
};

export default App;
