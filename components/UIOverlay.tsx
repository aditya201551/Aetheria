
import React, { useState } from 'react';
import { PointOfInterest } from '../types';
import { Loader2, Compass, ScrollText, MousePointerClick, X } from 'lucide-react';

interface UIOverlayProps {
  nearbyPoi: PointOfInterest | null;
  isGenerating: boolean;
  onInteract: () => void;
  isLocked: boolean;
  showLore: boolean;
  onCloseLore: () => void;
  isHoveringInteractable: boolean;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ 
  nearbyPoi, 
  isGenerating, 
  onInteract, 
  isLocked, 
  showLore,
  onCloseLore,
  isHoveringInteractable
}) => {
  const [isHoveringTop, setIsHoveringTop] = useState(false);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10 overflow-hidden">
      
      {/* --- Top Bar (Small Header -> Expands on Hover) --- */}
      <div 
        className={`absolute top-0 left-0 right-0 z-20 flex flex-col items-center transition-all duration-500 pointer-events-auto ${isHoveringTop ? 'h-32 bg-gradient-to-b from-black/90 to-transparent' : 'h-6'}`}
        onMouseEnter={() => setIsHoveringTop(true)}
        onMouseLeave={() => setIsHoveringTop(false)}
      >
        {/* Small visible handle/indicator */}
        <div className={`w-32 h-1 bg-white/20 rounded-full mt-2 transition-opacity duration-300 ${isHoveringTop ? 'opacity-0' : 'opacity-100'}`} />

        {/* Expanded Content */}
        <div className={`w-full flex justify-between items-start p-6 transition-all duration-500 ${isHoveringTop ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="text-white">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-400 bg-clip-text text-transparent">
                Aetheria
                </h1>
                <p className="text-xs text-gray-300 flex items-center gap-2 mt-1">
                <Compass size={12} className="text-cyan-400" /> Exploring the Low Poly Realms
                </p>
            </div>
            
            <div className="text-white text-right">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono text-gray-300">
                <span className="opacity-60">WASD</span> <span>Move</span>
                <span className="opacity-60">Shift</span> <span>Sprint</span>
                <span className="opacity-60">E</span> <span>Interact</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- Center Screen Elements --- */}

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200">
         <div className={`rounded-full transition-all duration-300 ${isHoveringInteractable ? 'w-3 h-3 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'w-1.5 h-1.5 bg-white/50'}`} />
      </div>

      {/* "Click to Start" Prompt */}
      {!isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none z-50">
           <div className="text-white text-center animate-pulse">
              <MousePointerClick className="mx-auto mb-2 text-cyan-400/80" size={40} />
              <h3 className="text-2xl font-light tracking-widest uppercase">Click to Explore</h3>
           </div>
        </div>
      )}

      {/* Interaction Prompt (Only if looking at interactable) */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none transition-all duration-300">
        {nearbyPoi && isHoveringInteractable && !showLore && !isGenerating && (
          <div className={`animate-in fade-in zoom-in duration-300 ${isLocked ? 'opacity-100' : 'opacity-0'}`}>
              <div className="bg-black/40 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full text-white/90 text-sm font-light flex items-center gap-3 shadow-lg">
                 <div className="bg-white/20 rounded px-1.5 py-0.5 font-mono text-xs">E</div>
                 <span>{nearbyPoi.isDiscovered ? 'View' : 'Inspect'} {nearbyPoi.name}</span>
              </div>
          </div>
        )}
        
        {isGenerating && (
           <div className="bg-black/60 backdrop-blur-md px-5 py-2 rounded-full text-cyan-300 text-xs tracking-wide flex items-center gap-2 border border-cyan-500/20 shadow-lg">
             <Loader2 className="animate-spin w-4 h-4" /> 
             <span>Listening...</span>
           </div>
        )}
      </div>

      {/* --- Bottom Right Lore Panel --- */}
      <div className="absolute bottom-8 right-8 pointer-events-auto z-20 w-full max-w-md px-4">
        {showLore && nearbyPoi && (
          <div className="relative animate-in slide-in-from-right-4 fade-in duration-500">
             {/* Card Container */}
            <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-left shadow-2xl relative overflow-hidden">
                
                {/* Decorative Gradient Line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                
                {/* Close Button */}
                <button 
                  onClick={onCloseLore}
                  className="absolute top-3 right-3 text-white/30 hover:text-white hover:bg-white/10 p-1 rounded-full transition-all"
                >
                  <X size={16} />
                </button>

                {/* Content */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-purple-300/70">
                    <ScrollText size={16} />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Lore Discovered</span>
                  </div>
                  
                  <h2 className="text-xl font-serif text-white tracking-wide">
                    {nearbyPoi.name}
                  </h2>
                  
                  <p className="text-sm text-gray-300 font-light leading-relaxed max-h-[40vh] overflow-y-auto custom-scrollbar">
                    "{nearbyPoi.description}"
                  </p>
                  
                  <div className="text-[10px] text-gray-600 mt-2 text-right">
                    Press <span className="font-mono text-gray-400">E</span> to close
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
