import React, { useState } from 'react';
import { TWEAK_PROJECT_FILES } from '../data/tweakFiles';
import { Copy, Check, FileCode, Download, FolderGit2, Folder, File, Terminal, Play, RotateCcw } from 'lucide-react';
import JSZip from 'jszip';

export const CodeExplorer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(2); // Default to Tweak.x
  const [copied, setCopied] = useState(false);
  const [buildRunning, setBuildRunning] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([
    '$ make clean package FINALPACKAGE=1',
    '==> Cleaning rootless project...',
    '==> Preprocessing Tweak.x (Logos parser)...',
    '==> Compiling Tweak.x (arm64)...',
    '==> Compiling Tweak.x (arm64e)...',
    '==> Linking FakeTrueTone.dylib...',
    '==> Generating debug symbols & codesigning with ldid...',
    '==> Packaging com.developer.faketruetone_1.0.0_iphoneos-arm64.deb...',
    '[SUCCESS] Build completed in 1.8s. Deb ready at ./packages/FakeTrueTone.deb'
  ]);

  const selectedFile = TWEAK_PROJECT_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllZip = async () => {
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

  const triggerSimulatedBuild = () => {
    setBuildRunning(true);
    setBuildLogs(['$ make clean package FINALPACKAGE=1', '==> Cleaning rootless build cache...']);
    setTimeout(() => {
      setBuildLogs((prev) => [...prev, '==> Invoking clang -arch arm64 -arch arm64e -isysroot iPhoneOS16.5.sdk...']);
    }, 400);
    setTimeout(() => {
      setBuildLogs((prev) => [
        ...prev,
        '==> Injected hooks: CBAdaptationClient, DisplayAndBrightnessSettingsController, CCUIContinuousSliderView',
        '==> Packaging com.developer.faketruetone_1.0.0_iphoneos-arm64.deb',
        '[SUCCESS] Package compiled for /var/jb rootless hierarchy!'
      ]);
      setBuildRunning(false);
    }, 900);
  };

  return (
    <div className="bg-[#0A0A0C] border border-[#27272A] rounded-lg overflow-hidden shadow-2xl flex flex-col min-h-[720px]">
      {/* High Density Toolbar */}
      <div className="h-10 bg-[#18181B] border-b border-[#27272A] px-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 font-mono text-[#A1A1AA]">
            <FolderGit2 className="w-4 h-4 text-orange-400" />
            <span className="text-white font-semibold">FakeTrueTone</span>
            <span className="text-[#71717A] text-[10px]">/ rootless / var/jb</span>
          </div>
          <span className="text-[#3F3F46]">|</span>
          <span className="text-[11px] font-mono text-[#A1A1AA]">
            {selectedFile.path}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={triggerSimulatedBuild}
            disabled={buildRunning}
            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded transition-all shadow-sm active:scale-95"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{buildRunning ? 'Compiling...' : 'Build & Package'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7] text-[11px] font-mono px-2.5 py-1 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadSingle}
            className="flex items-center gap-1 bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7] text-[11px] font-mono px-2.5 py-1 rounded transition-colors"
            title={`Download ${selectedFile.name}`}
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">File</span>
          </button>

          <button
            onClick={downloadAllZip}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-mono font-bold px-3 py-1 rounded transition-all shadow-sm"
          >
            <Download className="w-3 h-3" />
            <span>.ZIP</span>
          </button>
        </div>
      </div>

      {/* Main High Density Body: Left Sidebar + Editor & Terminal */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: File Tree & Architecture Box */}
        <aside className="w-full md:w-60 bg-[#121214] border-b md:border-b-0 md:border-r border-[#27272A] flex flex-col shrink-0 select-none">
          <div className="p-3">
            <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-3 font-mono">
              Project Explorer
            </div>
            <ul className="space-y-0.5 text-xs font-mono">
              <li className="flex items-center space-x-1.5 p-1 text-[#A1A1AA] hover:bg-[#18181B] rounded">
                <Folder className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                <span className="text-white font-medium text-[11px]">FakeTrueTone_Rootless</span>
              </li>

              {TWEAK_PROJECT_FILES.map((file, idx) => {
                const isSelected = idx === selectedFileIndex;
                const isTweak = file.name === 'Tweak.x';
                const isPlist = file.name.endsWith('.plist');

                return (
                  <li
                    key={file.path}
                    onClick={() => {
                      setSelectedFileIndex(idx);
                      setCopied(false);
                    }}
                    className={`flex items-center space-x-2 p-1.5 pl-5 rounded cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#27272A] text-white font-semibold'
                        : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-[#E4E4E7]'
                    }`}
                  >
                    {isTweak ? (
                      <span className="text-orange-400 font-mono italic text-[11px] font-bold">fx</span>
                    ) : isPlist ? (
                      <span className="text-purple-400 text-xs">⚙️</span>
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-[#71717A]" />
                    )}
                    <span className="text-[11px] truncate">{file.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Architecture Box (High Density Specs) */}
          <div className="mt-auto p-3 border-t border-[#27272A] bg-[#0E0E10]">
            <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
              Target Architecture
            </div>
            <div className="bg-[#0A0A0C] p-2.5 rounded border border-[#27272A] space-y-1 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-[#71717A]">Target:</span>
                <span className="text-white font-semibold">arm64 / arm64e</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Scheme:</span>
                <span className="text-orange-400 font-bold">rootless (/var/jb)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Min iOS:</span>
                <span className="text-green-400">15.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717A]">Max iOS:</span>
                <span className="text-green-400">16.7.x</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center & Right: Code Editor + Bottom Debug Output Log */}
        <main className="flex-1 flex flex-col bg-[#0F0F12] overflow-hidden">
          {/* File Tabs Strip */}
          <div className="h-8 bg-[#18181B] border-b border-[#27272A] flex items-center px-2 overflow-x-auto scrollbar-none space-x-1">
            {TWEAK_PROJECT_FILES.map((file, idx) => {
              const isActive = idx === selectedFileIndex;
              return (
                <button
                  key={file.name}
                  onClick={() => {
                    setSelectedFileIndex(idx);
                    setCopied(false);
                  }}
                  className={`px-3 h-full flex items-center space-x-1.5 text-[11px] font-mono transition-colors border-r border-[#27272A] ${
                    isActive
                      ? 'bg-[#0F0F12] text-white border-t-2 border-t-orange-500 font-semibold'
                      : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#121214]'
                  }`}
                >
                  <span>{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* Main Code View with Line Numbers & Watermark */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-relaxed relative max-h-[460px]">
            {/* Dopamine Watermark */}
            <div className="absolute top-2 right-4 text-6xl font-black text-[#27272A]/30 pointer-events-none select-none tracking-tighter">
              DOPAMINE
            </div>

            <div className="flex min-w-full">
              {/* Line Numbers */}
              <div className="pr-4 border-r border-[#27272A] text-right text-[#3F3F46] select-none text-[11px] leading-[22px] font-mono shrink-0">
                {selectedFile.content.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code Content */}
              <div className="pl-4 space-y-[2px] w-full text-[#D1D1D6] font-mono whitespace-pre overflow-x-auto text-[11px] sm:text-[12px] leading-[22px]">
                {selectedFile.content.split('\n').map((line, idx) => (
                  <div key={idx}>{renderHighDensitySyntax(line, selectedFile.language)}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom High Density Console / Debug Output Log */}
          <div className="h-44 border-t border-[#27272A] bg-black flex flex-col shrink-0">
            <div className="h-7 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between px-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[10px] font-mono font-bold text-[#71717A] uppercase tracking-widest">
                  Debug Output & Theos Build Log
                </span>
              </div>
              <span className="text-[10px] font-mono text-green-400">
                ● Ready for respring
              </span>
            </div>

            <div className="p-3 font-mono text-[11px] text-[#A1A1AA] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-[#27272A]">
              {buildLogs.map((logLine, i) => {
                const isSuccess = logLine.includes('[SUCCESS]');
                const isCmd = logLine.startsWith('$');
                const isArrow = logLine.startsWith('==>');

                return (
                  <div
                    key={i}
                    className={
                      isSuccess
                        ? 'text-green-400 font-bold'
                        : isCmd
                        ? 'text-white font-semibold'
                        : isArrow
                        ? 'text-orange-400/90'
                        : 'text-[#D4D4D8]'
                    }
                  >
                    {logLine}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

function renderHighDensitySyntax(line: string, lang: string): React.ReactNode {
  const trimmed = line.trim();

  // Comments
  if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('<!--')) {
    return <span className="text-[#71717A] italic">{line}</span>;
  }
  // Imports / Preprocessors
  if (trimmed.startsWith('#import') || trimmed.startsWith('#define') || trimmed.startsWith('#pragma')) {
    return <span className="text-purple-400 font-semibold">{line}</span>;
  }
  // Logos Directives (%hook, %end, %new, %ctor, %orig)
  if (
    trimmed.startsWith('%hook') ||
    trimmed.startsWith('%end') ||
    trimmed.startsWith('%new') ||
    trimmed.startsWith('%ctor') ||
    trimmed.startsWith('%orig')
  ) {
    return <span className="text-orange-400 font-bold">{line}</span>;
  }
  // Objective-C methods (- (BOOL)...)
  if (trimmed.startsWith('- (') || trimmed.startsWith('+ (')) {
    return (
      <span>
        <span className="text-blue-400">{line.substring(0, line.indexOf(')') + 1)}</span>
        <span className="text-[#E4E4E7]">{line.substring(line.indexOf(')') + 1)}</span>
      </span>
    );
  }
  // Keywords in line
  if (line.includes('return YES;') || line.includes('return NO;')) {
    return (
      <span>
        {line.replace('return YES;', '')}
        <span className="text-orange-400">return </span>
        <span className="text-green-400 font-semibold">{line.includes('YES') ? 'YES' : 'NO'};</span>
      </span>
    );
  }

  return <span>{line}</span>;
}
