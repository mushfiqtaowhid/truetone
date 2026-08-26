import React, { useState } from 'react';
import { ControlCenterView } from './ControlCenterView';
import { SettingsView } from './SettingsView';
import { LiveLogs } from './LiveLogs';
import { SimulatedLog, TweakState } from '../types';
import { Sliders, Settings, SplitSquareVertical, RotateCcw, ShieldCheck, Sparkles, Smartphone } from 'lucide-react';

interface iOSSimulatorProps {
  tweakState: TweakState;
  setTweakState: React.Dispatch<React.SetStateAction<TweakState>>;
  logs: SimulatedLog[];
  onAddLog: (msg: string, process: 'SpringBoard' | 'CoreBrightness' | 'Preferences' | 'PreferencesSync') => void;
  onClearLogs: () => void;
}

export const IOSSimulator: React.FC<iOSSimulatorProps> = ({
  tweakState,
  setTweakState,
  logs,
  onAddLog,
  onClearLogs,
}) => {
  const [viewMode, setViewMode] = useState<'both' | 'control-center' | 'settings'>('both');

  const updateTrueTone = (enabled: boolean) => {
    setTweakState((prev) => ({ ...prev, trueToneEnabled: enabled }));
  };

  const updateDarkMode = (enabled: boolean) => {
    setTweakState((prev) => ({ ...prev, darkMode: enabled }));
  };

  const updateNightShift = (enabled: boolean) => {
    setTweakState((prev) => ({ ...prev, nightShift: enabled }));
  };

  const updateBrightness = (val: number) => {
    setTweakState((prev) => ({ ...prev, brightness: val }));
  };

  const resetAll = () => {
    setTweakState({
      trueToneEnabled: true,
      darkMode: true,
      nightShift: false,
      brightness: 75,
      iosVersion: '16.5',
      jailbreakEnv: 'Dopamine 2.x',
    });
    onAddLog('Reset all mock registers to defaults (True Tone: ON, Dark Mode: ON)', 'PreferencesSync');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-[#18181B] rounded-lg p-2.5 border border-[#27272A] flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono font-bold text-[#71717A] uppercase tracking-wider hidden sm:inline">
            Simulator View:
          </span>
          <div className="flex items-center bg-[#0A0A0C] p-0.5 rounded border border-[#27272A]">
            <button
              onClick={() => setViewMode('both')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                viewMode === 'both'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Split Dual</span>
            </button>
            <button
              onClick={() => setViewMode('control-center')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                viewMode === 'control-center'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Control Center</span>
            </button>
            <button
              onClick={() => setViewMode('settings')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                viewMode === 'settings'
                  ? 'bg-orange-600 text-white font-semibold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings.app</span>
            </button>
          </div>
        </div>

        {/* Right: Environment & Reset */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-[#A1A1AA] bg-[#0A0A0C] px-2.5 py-1 rounded border border-[#27272A] font-mono">
            <Smartphone className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[#71717A]">Target:</span>
            <select
              value={tweakState.iosVersion}
              onChange={(e) =>
                setTweakState((prev) => ({
                  ...prev,
                  iosVersion: e.target.value as '15.4' | '16.5',
                }))
              }
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="16.5" className="bg-[#18181B] text-white">iOS 16.5 (Dopamine arm64e)</option>
              <option value="15.4" className="bg-[#18181B] text-white">iOS 15.4 (Dopamine arm64)</option>
            </select>
          </div>

          <button
            onClick={resetAll}
            className="flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-white bg-[#0A0A0C] hover:bg-[#27272A] px-2.5 py-1 rounded border border-[#27272A] transition-colors font-mono"
            title="Reset to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Workspace: Devices Grid + Live Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Device Simulator Container */}
        <div
          className={`grid gap-5 ${
            viewMode === 'both'
              ? 'lg:col-span-7 xl:col-span-8 grid-cols-1 md:grid-cols-2'
              : 'lg:col-span-6 xl:col-span-7 grid-cols-1 max-w-md mx-auto w-full'
          }`}
        >
          {/* 1. Control Center Screen */}
          {(viewMode === 'both' || viewMode === 'control-center') && (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full max-w-[340px] sm:max-w-[360px] mb-1.5 px-2 text-xs">
                <span className="font-mono font-semibold text-[#E4E4E7] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-orange-400" />
                  Control Center (Expanded)
                </span>
                <span className="text-[10px] font-mono text-green-400 bg-green-950/40 px-1.5 py-0.5 rounded border border-green-800/40">
                  SpringBoard
                </span>
              </div>
              <ControlCenterView
                trueToneEnabled={tweakState.trueToneEnabled}
                setTrueToneEnabled={updateTrueTone}
                darkMode={tweakState.darkMode}
                setDarkMode={updateDarkMode}
                nightShift={tweakState.nightShift}
                setNightShift={updateNightShift}
                brightness={tweakState.brightness}
                setBrightness={updateBrightness}
                onActionLog={onAddLog}
              />
            </div>
          )}

          {/* 2. Settings App Screen */}
          {(viewMode === 'both' || viewMode === 'settings') && (
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full max-w-[340px] sm:max-w-[360px] mb-1.5 px-2 text-xs">
                <span className="font-mono font-semibold text-[#E4E4E7] flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-orange-400" />
                  Display & Brightness
                </span>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-800/40">
                  Preferences
                </span>
              </div>
              <SettingsView
                trueToneEnabled={tweakState.trueToneEnabled}
                setTrueToneEnabled={updateTrueTone}
                darkMode={tweakState.darkMode}
                setDarkMode={updateDarkMode}
                nightShift={tweakState.nightShift}
                setNightShift={updateNightShift}
                brightness={tweakState.brightness}
                setBrightness={updateBrightness}
                onActionLog={onAddLog}
              />
            </div>
          )}
        </div>

        {/* Live Diagnostics Log Inspector */}
        <div
          className={`${
            viewMode === 'both' ? 'lg:col-span-5 xl:col-span-4' : 'lg:col-span-6 xl:col-span-5'
          } h-[660px] flex flex-col`}
        >
          <LiveLogs logs={logs} onClearLogs={onClearLogs} />
        </div>
      </div>

      {/* Info Banner on Cross-Process Synchronization */}
      <div className="bg-[#121214] border border-[#27272A] rounded-lg p-3 flex items-start space-x-3">
        <div className="w-6 h-6 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20 mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs text-[#A1A1AA] space-y-1">
          <div className="font-mono font-bold text-white text-[11px]">
            Bidirectional State Synchronization (IPC / Darwin Notifications):
          </div>
          <p className="font-sans text-[11px] leading-relaxed text-[#71717A]">
            Toggling <strong className="text-orange-400">True Tone</strong> in Control Center instantly updates the switch in Settings (and vice-versa). Rootless preference state is persisted at <code className="text-orange-300 bg-[#0A0A0C] px-1 py-0.5 rounded font-mono">/var/jb/var/mobile/Library/Preferences/com.developer.faketruetone.plist</code> and dispatched via <code className="text-orange-300 bg-[#0A0A0C] px-1 py-0.5 rounded font-mono">notify_post("com.developer.faketruetone/preferenceChanged")</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
