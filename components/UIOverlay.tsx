import React from 'react';
import { PointOfInterest } from '../types';
import { Loader2, Compass, ScrollText, MousePointerClick, Keyboard } from 'lucide-react';

interface UIOverlayProps {
  nearbyPoi: PointOfInterest | null;
  isGenerating: boolean;
  onInteract: () => void;
  isLocked: boolean;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ nearbyPoi, isGenerating, onInteract, isLocked }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white shadow-lg">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-400 bg-clip-text text-transparent">
            Aetheria
          </h1>
          <p className="text-sm text-gray-300 flex items-center gap-2 mt-1">
            <Compass size={14} className="text-cyan-400" /> Exploring the Low Poly Realms
          </p>
        </div>
        
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white max-w-xs shadow-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Travel Guide</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm font-mono text-gray-200">
            <span className="opacity-70">WASD</span> <span>Move</span>
            <span className="opacity-70">Mouse</span> <span>Look</span>
            <span className="opacity-70">Shift</span> <span>Sprint</span>
            <span className="opacity-70">E</span> <span>Interact</span>
          </div>
        </div>
      </div>

      {/* Center Click to Start Prompt */}
      {!isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
           <div className="bg-black/60 backdrop-blur-lg border border-white/20 p-6 rounded-2xl text-white text-center shadow-2xl animate-pulse">
              <MousePointerClick className="mx-auto mb-3 text-cyan-400" size={32} />
              <h3 className="text-xl font-bold mb-1">Click to Explore</h3>
              <p className="text-sm text-gray-300">Click anywhere to lock your mouse and enter the world</p>
           </div>
        </div>
      )}

      {/* Interaction Area */}
      <div className="flex flex-col items-center gap-4 mb-10">
        {nearbyPoi && (
          <div className="pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
            
            {/* Interaction Prompt */}
            {!nearbyPoi.isDiscovered && !nearbyPoi.description && (
              <div className="flex flex-col items-center gap-2">
                {isLocked ? (
                  <div className="bg-black/70 backdrop-blur-md border border-cyan-500/50 px-6 py-3 rounded-full text-white font-medium flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                     <Keyboard className="text-cyan-400" />
                     <span>Press <span className="font-bold text-cyan-300 text-lg mx-1">E</span> to Inspect {nearbyPoi.name}</span>
                  </div>
                ) : (
                  <button
                    onClick={onInteract}
                    disabled={isGenerating}
                    className="group relative bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 px-8 py-4 rounded-full text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" /> Listening to the spirits...
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        Inspect {nearbyPoi.name}
                      </>
                    )}
                  </button>
                )}
                
                {isGenerating && (
                   <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-cyan-300 text-sm flex items-center gap-2">
                     <Loader2 className="animate-spin w-4 h-4" /> Unveiling ancient secrets...
                   </div>
                )}
              </div>
            )}

            {/* Lore Card */}
            {(nearbyPoi.description) && (
              <div className="max-w-xl bg-black/70 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                
                <div className="flex justify-center mb-4 text-purple-300">
                  <ScrollText size={40} className="drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                </div>
                <h2 className="text-3xl font-serif text-white mb-4 tracking-wide">{nearbyPoi.name}</h2>
                <p className="text-lg text-gray-200 font-light italic leading-relaxed">
                  "{nearbyPoi.description}"
                </p>
                <div className="mt-6 text-xs text-cyan-400 uppercase tracking-widest opacity-70 flex items-center justify-center gap-2">
                  <span className="w-8 h-[1px] bg-cyan-500/50"></span>
                  Lore Discovered
                  <span className="w-8 h-[1px] bg-cyan-500/50"></span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};