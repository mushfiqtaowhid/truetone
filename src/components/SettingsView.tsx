import React from 'react';
import { ChevronLeft, ChevronRight, Sun, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
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

export const SettingsView: React.FC<SettingsViewProps> = ({
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
  const [automaticAppearance, setAutomaticAppearance] = React.useState(false);

  const toggleTrueTone = () => {
    const next = !trueToneEnabled;
    setTrueToneEnabled(next);
    onActionLog?.(
      `DisplayAndBrightnessSettingsController -[setFakeTrueTone:${next ? '@(YES)' : '@(NO)'} specifier:TRUE_TONE] -> CFPreferencesSetAppValue & notify_post()`,
      'Preferences'
    );
  };

  return (
    <div
      className={`w-full max-w-[340px] sm:max-w-[380px] mx-auto rounded-[48px] p-5 sm:p-6 border shadow-2xl transition-colors duration-300 select-none flex flex-col justify-between min-h-[640px] ${
        darkMode
          ? 'bg-black text-white border-neutral-800'
          : 'bg-[#F2F2F7] text-neutral-900 border-neutral-300'
      }`}
    >
      {/* iOS Status Bar & Nav Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold px-2 pt-1 pb-3 text-neutral-400">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 rounded-sm border border-current flex items-center p-0.5">
              <div className="w-full h-full bg-current rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="relative flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
          <button className="flex items-center text-[#007AFF] text-sm font-normal -ml-1">
            <ChevronLeft className="w-5 h-5 -mr-1" />
            <span>Settings</span>
          </button>
          <span className="font-semibold text-sm tracking-tight text-center absolute left-1/2 -translate-x-1/2">
            Display & Brightness
          </span>
          <div className="w-10" />
        </div>

        {/* APPEARANCE SECTION */}
        <div className="mt-4">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-2 block">
            Appearance
          </span>

          {/* Light / Dark Preview Cards */}
          <div
            className={`rounded-2xl p-4 flex flex-col gap-4 ${
              darkMode ? 'bg-[#1C1C1E]' : 'bg-white'
            } shadow-sm`}
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Light Option */}
              <div
                onClick={() => {
                  setDarkMode(false);
                  onActionLog?.(`User selected Light Appearance`, 'Preferences');
                }}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-20 h-28 rounded-xl border border-neutral-300 bg-gradient-to-b from-amber-100 via-rose-100 to-sky-200 p-1.5 flex flex-col justify-between shadow-inner transition-transform group-hover:scale-105">
                  <div className="w-full bg-white/80 rounded-md p-1 flex flex-col gap-0.5 shadow-2xs">
                    <div className="h-1.5 w-6 bg-neutral-800/60 rounded-xs" />
                    <div className="h-1 w-10 bg-neutral-800/30 rounded-xs" />
                  </div>
                  <div className="w-full bg-white/80 rounded-md p-1 shadow-2xs flex flex-col gap-0.5">
                    <div className="h-1 w-12 bg-neutral-800/40 rounded-xs" />
                  </div>
                </div>
                <span className="text-xs font-medium">Light</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    !darkMode
                      ? 'bg-[#007AFF] border-[#007AFF] text-white'
                      : 'border-neutral-500'
                  }`}
                >
                  {!darkMode && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Dark Option */}
              <div
                onClick={() => {
                  setDarkMode(true);
                  onActionLog?.(`User selected Dark Appearance`, 'Preferences');
                }}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-20 h-28 rounded-xl border border-neutral-700 bg-gradient-to-b from-neutral-900 via-neutral-950 to-slate-900 p-1.5 flex flex-col justify-between shadow-inner transition-transform group-hover:scale-105">
                  <div className="w-full bg-neutral-800/80 rounded-md p-1 flex flex-col gap-0.5 shadow-2xs">
                    <div className="h-1.5 w-6 bg-white/60 rounded-xs" />
                    <div className="h-1 w-10 bg-white/30 rounded-xs" />
                  </div>
                  <div className="w-full bg-neutral-800/80 rounded-md p-1 shadow-2xs flex flex-col gap-0.5">
                    <div className="h-1 w-12 bg-white/40 rounded-xs" />
                  </div>
                </div>
                <span className="text-xs font-medium">Dark</span>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    darkMode
                      ? 'bg-[#007AFF] border-[#007AFF] text-white'
                      : 'border-neutral-400'
                  }`}
                >
                  {darkMode && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>

            {/* Automatic toggle */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-sm font-medium">Automatic</span>
              <button
                onClick={() => setAutomaticAppearance(!automaticAppearance)}
                className={`w-12 h-7 rounded-full transition-colors relative p-0.5 flex items-center ${
                  automaticAppearance ? 'bg-[#34C759]' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`w-6 h-6 rounded-full bg-white shadow-md ${
                    automaticAppearance ? 'ml-auto' : 'ml-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* BRIGHTNESS SECTION */}
        <div className="mt-5">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-3 mb-2 block">
            Brightness
          </span>

          <div
            className={`rounded-2xl divide-y ${
              darkMode
                ? 'bg-[#1C1C1E] divide-neutral-800'
                : 'bg-white divide-neutral-200'
            } shadow-sm overflow-hidden`}
          >
            {/* Brightness Slider */}
            <div className="p-3.5 flex items-center gap-3">
              <Sun className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="range"
                min="5"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-[#007AFF] h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              />
              <Sun className="w-6 h-6 text-neutral-400 shrink-0" />
            </div>

            {/* TRUE TONE ROW (INJECTED PSSwitchCell) */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">True Tone</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold border border-blue-500/20">
                  Hooked
                </span>
              </div>

              {/* iOS Styled Switch */}
              <button
                id="btn-settings-true-tone-switch"
                onClick={toggleTrueTone}
                className={`w-12 h-7 rounded-full transition-colors relative p-0.5 flex items-center focus:outline-none ${
                  trueToneEnabled ? 'bg-[#34C759]' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`w-6 h-6 rounded-full bg-white shadow-md ${
                    trueToneEnabled ? 'ml-auto' : 'ml-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Explanation Note matching iOS exactly */}
          <p className="text-[11px] text-neutral-500 px-3 pt-2 leading-relaxed">
            Automatically adapt iPhone display based on ambient lighting conditions to make colours
            appear consistent in different environments.
          </p>
        </div>

        {/* Night Shift Row */}
        <div className="mt-4">
          <div
            onClick={() => {
              setNightShift(!nightShift);
              onActionLog?.(`Toggled Night Shift in Settings`, 'Preferences');
            }}
            className={`rounded-2xl p-3.5 flex items-center justify-between cursor-pointer shadow-sm ${
              darkMode ? 'bg-[#1C1C1E]' : 'bg-white'
            }`}
          >
            <span className="text-sm font-medium">Night Shift</span>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <span>{nightShift ? 'On' : 'Off'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="pt-2 text-center">
        <span className="text-[10px] text-neutral-400 font-mono">
          Preferences.framework • DisplayAndBrightnessSettingsController
        </span>
      </div>
    </div>
  );
};
