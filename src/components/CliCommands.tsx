import React, { useState } from 'react';
import { CLI_COMMANDS } from '../data/tweakFiles';
import { Terminal, Copy, Check, ShieldAlert, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export const CliCommands: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="bg-[#121214] border border-[#27272A] rounded-lg p-4 sm:p-5 shadow-xl">
        <div className="flex items-center space-x-3 mb-1.5">
          <div className="w-8 h-8 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-tight">
              Rootless Theos Compilation & Sileo Deployment CLI
            </h2>
            <p className="text-xs text-[#71717A] font-mono">
              Build pipeline for arm64/arm64e .deb packages targeting Dopamine (iOS 15.0–16.7.x)
            </p>
          </div>
        </div>
      </div>

      {/* Step by Step CLI Execution */}
      <div className="space-y-3">
        {CLI_COMMANDS.map((item, idx) => (
          <div
            key={item.title}
            className="bg-[#121214] border border-[#27272A] rounded-lg p-3.5 shadow-md space-y-2 hover:border-[#3F3F46] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-xs text-white flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span>{item.title}</span>
              </span>
              <button
                onClick={() => copyCommand(item.cmd, idx)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#18181B] hover:bg-[#27272A] text-[#E4E4E7] text-[11px] font-mono rounded border border-[#27272A] transition-colors"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed">{item.desc}</p>

            <div className="bg-[#0A0A0C] rounded p-2.5 border border-[#27272A] font-mono text-[11.5px] text-green-400 flex items-center justify-between">
              <span>$ {item.cmd}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sileo & Dopamine Deployment Checklist */}
      <div className="bg-[#121214] border border-[#27272A] rounded-lg p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span>Dopamine Rootless Deployment Flow</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-[#0A0A0C] p-3 rounded border border-[#27272A] space-y-1.5">
            <span className="font-semibold text-orange-400 text-xs block">Method 1: Sileo / Filza</span>
            <p className="text-[#71717A] leading-relaxed text-[11px]">
              Transfer the generated <code className="text-[#D4D4D8]">.deb</code> to device via AirDrop or Filza. Tap in Sileo/Filza to install directly.
            </p>
          </div>

          <div className="bg-[#0A0A0C] p-3 rounded border border-[#27272A] space-y-1.5">
            <span className="font-semibold text-purple-400 text-xs block">Method 2: Theos Wi-Fi Deploy</span>
            <p className="text-[#71717A] leading-relaxed text-[11px]">
              Run <code className="text-[#D4D4D8]">make do THEOS_DEVICE_IP=192.168.x.x</code>. Automatically compiles, transfers over SSH, and runs <code className="text-[#D4D4D8]">sbreload</code>.
            </p>
          </div>

          <div className="bg-[#0A0A0C] p-3 rounded border border-[#27272A] space-y-1.5">
            <span className="font-semibold text-green-400 text-xs block">Method 3: APT Repository</span>
            <p className="text-[#71717A] leading-relaxed text-[11px]">
              Add <code className="text-[#D4D4D8]">.deb</code> to your Cydia/Sileo repo pool, regenerate <code className="text-[#D4D4D8]">Packages.bz2</code>, and distribute over HTTPS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
