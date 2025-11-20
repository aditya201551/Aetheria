export interface PointOfInterest {
  id: string;
  position: [number, number, number];
  type: 'ruin' | 'tree' | 'crystal' | 'monolith';
  name: string;
  description?: string; // AI generated description
  isDiscovered: boolean;
}

export interface GameState {
  isGeneratingLore: boolean;
  nearbyPoi: PointOfInterest | null;
  pois: PointOfInterest[];
}

export enum LoreType {
  DISCOVERY = 'DISCOVERY',
  AMBIENT = 'AMBIENT'
}

export interface RemotePlayer {
  id: string;
  position: [number, number, number];
  rotation: number;
}

// Mutable ref type for performance (avoiding react re-renders on every frame tick)
export interface TimeContextType {
  timeRef: React.MutableRefObject<number>; // 0 to 1 (0 = dawn, 0.25 = noon, 0.5 = dusk, 0.75 = midnight)
  isNight: () => boolean;
}