import React from 'react';

export const ScanOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-row">
      {/* Left Zone */}
      <div className="flex-1 border-r border-dashed border-white/30 relative flex items-center justify-center">
        <div className="w-3/4 h-3/4 border-2 border-white/50 rounded-lg flex items-end justify-center pb-4">
           <span className="text-white/50 font-bold text-xl uppercase tracking-widest">Left</span>
        </div>
      </div>
      
      {/* Right Zone */}
      <div className="flex-1 relative flex items-center justify-center">
        <div className="w-3/4 h-3/4 border-2 border-white/50 rounded-lg flex items-end justify-center pb-4">
           <span className="text-white/50 font-bold text-xl uppercase tracking-widest">Right</span>
        </div>
      </div>

      {/* Center Line Indicator */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
        <div className="w-full h-px bg-red-500/20"></div>
      </div>
    </div>
  );
};
