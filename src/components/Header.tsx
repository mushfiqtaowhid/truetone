import React from 'react';
import { Download, Terminal, Smartphone, Code2, BookOpen, Layers, Cpu, ShieldCheck } from 'lucide-react';
import JSZip from 'jszip';
import { TWEAK_PROJECT_FILES } from '../data/tweakFiles';

interface HeaderProps {
  activeTab: 'simulator' | 'code' | 'architecture' | 'cli';
  setActiveTab: (tab: 'simulator' | 'code' | 'architecture' | 'cli') => void;
  trueToneEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  trueToneEnabled,
}) => {
  const downloadZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder('FakeTrueTone');

    TWEAK_PROJECT_FILES.forEach((file) => {
      if (file.path.startsWith('layout/')) {
        folder?.file(file.path, file.content);
      } else {
        folder?.file(file.name, file.content);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FakeTrueTone-Rootless-Theos.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-12 bg-[#18181B] border-b border-[#27272A] text-[#E4E4E7] sticky top-0 z-50 select-none">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 h-full flex items-center justify-between">
        {/* Brand & Badges */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-[10px] font-mono font-bold text-black shadow-sm">
              TH
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-semibold text-xs tracking-tight text-white uppercase font-mono">
                THEOS CLOUD IDE
              </span>
              <span className="text-[#71717A] text-[11px] font-mono hidden md:inline">
                — v4.2.0-rootless
              </span>
            </div>
          </div>

          {/* Navigation Tabs (IDE Style) */}
          <nav className="flex items-center space-x-1 sm:space-x-3 text-xs font-medium pl-2 border-l border-[#27272A]">
            <button
              id="nav-simulator"
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 py-3 px-2 transition-all relative ${
                activeTab === 'simulator'
                  ? 'text-white border-b-2 border-orange-500 font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulator</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  trueToneEnabled ? 'bg-green-500 shadow-[0_0_6px_#22c55e]' : 'bg-[#52525B]'
                }`}
                title={`True Tone state: ${trueToneEnabled ? 'ON' : 'OFF'}`}
              />
            </button>

            <button
              id="nav-code"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 py-3 px-2 transition-all relative ${
                activeTab === 'code'
                  ? 'text-white border-b-2 border-orange-500 font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Tweak.x & Theos</span>
            </button>

            <button
              id="nav-architecture"
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-1.5 py-3 px-2 transition-all relative ${
                activeTab === 'architecture'
                  ? 'text-white border-b-2 border-orange-500 font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Hooks & Architecture</span>
            </button>

            <button
              id="nav-cli"
              onClick={() => setActiveTab('cli')}
              className={`flex items-center gap-1.5 py-3 px-2 transition-all relative ${
                activeTab === 'cli'
                  ? 'text-white border-b-2 border-orange-500 font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Build CLI</span>
            </button>
          </nav>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center space-x-2.5">
          <div className="hidden sm:flex items-center space-x-2 bg-[#0A0A0C] px-2.5 py-1 rounded-full border border-[#27272A]">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">
              Dopamine Connected (iOS 16.5)
            </span>
          </div>

          <button
            id="btn-download-theos-zip"
            onClick={downloadZip}
            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded transition-all uppercase tracking-wider shadow-sm active:scale-95"
            title="Download full project as .zip"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export .ZIP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
