'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center ml-2"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <Info className="w-4 h-4 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />

      {isVisible && (
        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 p-3 bg-slate-950 border border-slate-800 rounded-lg shadow-xl text-xs text-slate-400 z-50 animate-in fade-in zoom-in-95 duration-200">
          {text}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-8 border-transparent border-t-slate-950" />
        </div>
      )}
    </div>
  );
}
