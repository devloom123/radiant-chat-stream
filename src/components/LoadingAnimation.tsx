
import React from 'react';

export const LoadingAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0A0E1A] via-[#1A1F2E] to-[#0F1419] flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-8">
        {/* Main loading animation */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[#22C55E]/20 border-t-[#22C55E] rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-[#22C55E]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-l-[#22C55E]/60 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
        </div>

        {/* Logo and branding */}
        <div className="text-center animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/7a0c30ed-fbe4-42c1-abce-64a0a528fabf.png" 
              alt="DevLoom AI" 
              className="w-12 h-12 rounded-2xl shadow-2xl ring-2 ring-[#22C55E]/20 animate-float"
            />
            <div>
              <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                DevLoom AI
              </h1>
              <p className="text-gray-400 text-sm">Initializing your AI workspace...</p>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-[#22C55E] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Loading text */}
        <div className="text-center max-w-md">
          <p className="text-gray-300 text-lg font-medium mb-2">Setting up your experience</p>
          <p className="text-gray-500 text-sm">Preparing advanced AI capabilities and modern interface</p>
        </div>
      </div>
    </div>
  );
};
