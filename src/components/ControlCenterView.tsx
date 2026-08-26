import React, { useRef, useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ControlCenterViewProps {
  trueToneEnabled: boolean;
  setTrueToneEnabled: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  nightShift: boolean;
  setNightShift: (val: boolean) => void;
  brightness: number;
  setBrightness: (val: number) => void;
  onActionLog?: (msg: string, process: 'SpringBoard' | 'CoreBrightness' | 'Preferences' | 'PreferencesSync') => void;
}

export const ControlCenterView: React.FC<ControlCenterViewProps> = ({
  trueToneEnabled,
  setTrueToneEnabled,
  darkMode,
  setDarkMode,
  nightShift,
  setNightShift,
  brightness,
  setBrightness,
  onActionLog,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSliderInteraction = (clientY: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const height = rect.height;
    const relativeY = clientY - rect.top;
    // Top is 100%, bottom is 0%
    const percentage = Math.max(5, Math.min(100, Math.round(((height - relativeY) / height) * 100)));
    setBrightness(percentage);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleSliderInteraction(e.clientY);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        handleSliderInteraction(e.clientY);
      }
    };
    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const toggleTrueTone = () => {
    const next = !trueToneEnabled;
    setTrueToneEnabled(next);
    onActionLog?.(
      `CCUIExpandedModuleContinuousSliderProvider -[setTrueToneEnabled:${next ? 'YES' : 'NO'}] -> Updated dummy state and dispatched notify_post("com.developer.faketruetone.changed")`,
      'SpringBoard'
    );
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    onActionLog?.(
      `UISCurrentUserInterfaceStyleMode -[setCustomUserInterfaceStyleMode:${next ? '2' : '1'}]`,
      'SpringBoard'
    );
  };

  const toggleNightShift = () => {
    const next = !nightShift;
    setNightShift(next);
    onActionLog?.(
      `CBBlueLightReductionClient -[setEnabled:${next ? 'YES' : 'NO'}]`,
      'CoreBrightness'
    );
  };

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[380px] mx-auto rounded-[48px] p-6 sm:p-8 bg-gradient-to-b from-stone-900/90 via-slate-900/95 to-black text-white shadow-2xl border border-white/10 select-none overflow-hidden backdrop-blur-2xl flex flex-col items-center justify-between min-h-[640px]">
      {/* Background blurred ambiance */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: nightShift
            ? 'radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.15), transparent 70%)'
            : trueToneEnabled
            ? 'radial-gradient(circle at 50% 30%, rgba(59, 130, 246, 0.12), transparent 70%)'
            : 'none',
        }}
      />

      {/* Top Header Glyph (Sun) */}
      <div className="pt-2 flex flex-col items-center">
        <motion.div
          animate={{ scale: isDragging ? 1.15 : 1, rotate: brightness * 1.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-12 h-12 flex items-center justify-center text-white/90"
        >
          <Sun className="w-8 h-8 stroke-[1.5]" />
        </motion.div>
        <span className="text-[10px] tracking-wider uppercase font-semibold text-white/40 mt-1">
          {brightness}% Brightness
        </span>
      </div>

      {/* Main Expanded Vertical Slider */}
      <div className="my-6 w-full flex justify-center">
        <div
          ref={sliderRef}
          onPointerDown={handlePointerDown}
          className="relative w-28 sm:w-32 h-64 rounded-[36px] bg-black/60 border border-white/15 overflow-hidden cursor-ns-resize shadow-inner flex flex-col justify-end touch-none active:scale-[0.98] transition-transform"
        >
          {/* Glass fill overlay */}
          <motion.div
            className="w-full bg-white transition-colors duration-200"
            style={{
              height: `${brightness}%`,
              backgroundColor: nightShift ? '#FEEBC8' : '#FFFFFF',
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          />

          {/* Internal slider thumb gradient / subtle lighting */}
          <div className="absolute inset-0 pointer-events-none rounded-[36px] shadow-[inset_0_2px_12px_rgba(255,255,255,0.2)]" />
        </div>
      </div>

      {/* 3 Circular Action Buttons Matching Uploaded Screenshot */}
      <div className="w-full grid grid-cols-3 gap-3 pt-2 pb-1">
        {/* 1. Dark Mode Toggle */}
        <button
          id="btn-cc-dark-mode"
          onClick={toggleDarkMode}
          className="flex flex-col items-center gap-2 group focus:outline-none"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
              darkMode
                ? 'bg-blue-600 text-white shadow-blue-600/40 ring-2 ring-blue-400/50'
                : 'bg-white/15 text-white hover:bg-white/25 active:scale-95'
            }`}
          >
            {/* Custom SVG icon for iOS Dark Mode (half filled circle) */}
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
            </svg>
          </div>
          <div className="text-center">
            <div className="text-[11px] font-semibold text-white/90 leading-tight">Dark Mode</div>
            <div className="text-[10px] text-white/50">{darkMode ? 'On' : 'Off'}</div>
          </div>
        </button>

        {/* 2. Night Shift Toggle */}
        <button
          id="btn-cc-night-shift"
          onClick={toggleNightShift}
          className="flex flex-col items-center gap-2 group focus:outline-none"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
              nightShift
                ? 'bg-amber-500 text-white shadow-amber-500/40 ring-2 ring-amber-400/50'
                : 'bg-white/15 text-white hover:bg-white/25 active:scale-95'
            }`}
          >
            <Sun className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div className="text-center">
            <div className="text-[11px] font-semibold text-white/90 leading-tight">Night Shift</div>
            <div className="text-[10px] text-white/50">{nightShift ? 'On' : 'Off'}</div>
          </div>
        </button>

        {/* 3. True Tone Toggle (Our Dummy Tweak Feature) */}
        <button
          id="btn-cc-true-tone"
          onClick={toggleTrueTone}
          className="flex flex-col items-center gap-2 group focus:outline-none"
        >
          <motion.div
            whileTap={{ scale: 0.92 }}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
              trueToneEnabled
                ? 'bg-[#007AFF] text-white shadow-blue-500/50 ring-2 ring-blue-300/60'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {/* iOS True Tone Icon (Sun with segmented horizontal lines) */}
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Central horizontal slit pattern matching Apple True Tone icon */}
              <circle cx="12" cy="12" r="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="8" y1="14" x2="16" y2="14" />
              {/* Outer rays */}
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
              <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
              <line x1="2" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
              <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
              <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
            </svg>
          </motion.div>
          <div className="text-center">
            <div className="text-[11px] font-semibold text-white/90 leading-tight flex items-center justify-center gap-1">
              True Tone
            </div>
            <div className={`text-[10px] font-medium ${trueToneEnabled ? 'text-blue-400' : 'text-white/50'}`}>
              {trueToneEnabled ? 'On' : 'Off'}
            </div>
          </div>
        </button>
      </div>

      {/* Footer Pill Status Indicator */}
      <div className="mt-2 text-center text-[10px] text-white/40 flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>CCUIModuleSliderView Hook Active</span>
      </div>
    </div>
  );
};
