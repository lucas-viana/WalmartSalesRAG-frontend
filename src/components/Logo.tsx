import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`} id="walmart-logo">
      {/* Walmart Yellow Spark Icon */}
      <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center bg-walmart-yellow rounded-full shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="w-5.5 h-5.5 text-walmart-blue transform hover:scale-105 transition-transform duration-200"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2L14.4 8.5H21.2L15.7 12.5L17.8 19L12 15L6.2 19L8.3 12.5L2.8 8.5H9.6L12 2Z"/>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none leading-none">
          <div className="flex items-center gap-1.55">
            <span className="font-display font-bold text-lg tracking-tight text-white">
              WALMART SALES
            </span>
          </div>
          <span className="text-[11px] font-semibold text-walmart-yellow tracking-widest uppercase font-mono mt-0.5">
            RAG Assistant
          </span>
        </div>
      )}
    </div>
  );
}
