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