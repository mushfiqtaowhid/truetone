import React, { useState } from 'react';
import { Header } from './components/Header';
import { IOSSimulator } from './components/iOSSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { CliCommands } from './components/CliCommands';
import { SimulatedLog, TweakState } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ShieldCheck, Terminal, Smartphone, Code2, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'architecture' | 'cli'>('simulator');

  const [tweakState, setTweakState] = useState<TweakState>({
    trueToneEnabled: true,
    darkMode: true,
    nightShift: false,
    brightness: 75,
    iosVersion: '16.5',
    jailbreakEnv: 'Dopamine 2.x',
  });

  const [logs, setLogs] = useState<SimulatedLog[]>([
    {
      id: '1',
      timestamp: '09:41:00.102',
      process: 'CoreBrightness',
      level: 'hook',
      message: '[CBAdaptationClient supported] -> Returning YES (Fake True Tone capability injected)',
    },
    {
      id: '2',
      timestamp: '09:41:00.124',
      process: 'Preferences',
      level: 'info',
      message: 'DisplayAndBrightnessSettingsController: Injected True Tone PSSwitchCell into specifiers list',
    },
    {
      id: '3',
      timestamp: '09:41:00.180',
      process: 'SpringBoard',
      level: 'hook',
      message: 'CCUIExpandedModuleContinuousSliderProvider: Rendered True Tone circular module button (State: 1)',
    },
    {
      id: '4',
      timestamp: '09:41:00.210',
      process: 'PreferencesSync',
      level: 'pref',
      message: 'Loaded /var/jb/var/mobile/Library/Preferences/com.developer.faketruetone.plist via CFPreferences',
    },
  ]);

  const addLog = (
    msg: string,
    process: 'SpringBoard' | 'CoreBrightness' | 'Preferences' | 'PreferencesSync'
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
      now.getMilliseconds()
    ).padStart(3, '0')}`;

    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: timeStr,
        process,
        level: 'hook',
        message: msg,
      },
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E4E4E7] font-sans selection:bg-orange-500 selection:text-black flex flex-col justify-between overflow-x-hidden">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        trueToneEnabled={tweakState.trueToneEnabled}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'simulator' && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <IOSSimulator
                tweakState={tweakState}
                setTweakState={setTweakState}
                logs={logs}
                onAddLog={addLog}
                onClearLogs={clearLogs}
              />
            </motion.div>
          )}

          {activeTab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <CodeExplorer />
            </motion.div>
          )}

          {activeTab === 'architecture' && (
            <motion.div
              key="architecture"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <ArchitectureDocs />
            </motion.div>
          )}

          {activeTab === 'cli' && (
            <motion.div
              key="cli"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <CliCommands />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* High Density IDE Status Bar Footer */}
      <footer className="h-6 bg-[#18181B] border-t border-[#27272A] px-3 sm:px-4 flex items-center justify-between text-[10px] text-[#71717A] font-mono select-none">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <span className="flex items-center text-[#A1A1AA]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e] mr-1.5" />
            Master (Rootless)
          </span>
          <span className="hidden sm:inline">UTF-8</span>
          <span className="hidden md:inline">Tab Size: 4</span>
          <span className="hidden md:inline text-orange-400 font-semibold">arm64 / arm64e</span>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <span className="hidden sm:inline">Hooks: CoreBrightness • Preferences • CCUI</span>
          <span className="text-[#A1A1AA] font-bold">Theos 3.0-Dopamine</span>
        </div>
      </footer>
    </div>
  );
}
