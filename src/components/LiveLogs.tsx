import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, ShieldCheck, Activity, Copy, Check } from 'lucide-react';
import { SimulatedLog } from '../types';

interface LiveLogsProps {
  logs: SimulatedLog[];
  onClearLogs: () => void;
}

export const LiveLogs: React.FC<LiveLogsProps> = ({ logs, onClearLogs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const copyLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.process}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0A0A0C] rounded-lg border border-[#27272A] p-3 flex flex-col h-full shadow-lg">
      {/* Log Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#27272A] text-xs">
        <div className="flex items-center space-x-2 text-[#E4E4E7] font-mono font-semibold">
          <Terminal className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-[11px] uppercase tracking-wider">os_log / Hook Diagnostics</span>
          <span className="px-1.5 py-0.5 rounded bg-green-950 text-green-400 font-mono text-[9px] font-bold border border-green-800">
            STREAM
          </span>
        </div>
        <div className="flex items-center space-x-1.5 font-mono">
          <button
            onClick={copyLogs}
            className="flex items-center gap-1 text-[#A1A1AA] hover:text-white px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[10px] transition-colors"
            title="Copy Logs"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 text-[#A1A1AA] hover:text-red-400 px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[10px] transition-colors"
            title="Clear console"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Log Streams */}
      <div
        ref={scrollRef}
        className="mt-2.5 flex-1 overflow-y-auto font-mono text-[11px] space-y-1 pr-1 max-h-[300px] lg:max-h-full scrollbar-thin scrollbar-thumb-[#27272A]"
      >
        {logs.length === 0 ? (
          <div className="text-[#52525B] italic py-8 text-center text-xs">
            No hook events recorded yet. Interact with True Tone in the simulator.
          </div>
        ) : (
          logs.map((log) => {
            const processColor =
              log.process === 'CoreBrightness'
                ? 'text-orange-400 bg-orange-950/40 border-orange-800/50'
                : log.process === 'SpringBoard'
                ? 'text-green-400 bg-green-950/40 border-green-800/50'
                : log.process === 'Preferences'
                ? 'text-purple-400 bg-purple-950/40 border-purple-800/50'
                : 'text-sky-400 bg-sky-950/40 border-sky-800/50';

            return (
              <div
                key={log.id}
                className="leading-tight flex items-start space-x-1.5 hover:bg-[#18181B] p-1 rounded transition-colors text-[10.5px]"
              >
                <span className="text-[#52525B] shrink-0 select-none text-[10px]">{log.timestamp}</span>
                <span
                  className={`px-1 py-0.2 rounded border text-[9px] font-mono font-bold shrink-0 ${processColor}`}
                >
                  {log.process}
                </span>
                <span className="text-[#D4D4D8] break-all leading-snug">{log.message}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Quick stats footer */}
      <div className="mt-2.5 pt-2 border-t border-[#27272A] flex items-center justify-between text-[10px] text-[#71717A] font-mono">
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3 h-3 text-orange-400" />
          <span>IPC Darwin notify_post dispatch active</span>
        </div>
        <span className="text-[#A1A1AA]">Events: {logs.length}</span>
      </div>
    </div>
  );
};
