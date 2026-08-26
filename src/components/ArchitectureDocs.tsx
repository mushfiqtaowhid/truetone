import React from 'react';
import { Cpu, ShieldCheck, CheckCircle2, AlertTriangle, Layers, Zap, BookOpen, Terminal } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Intro Section */}
      <div className="bg-[#121214] border border-[#27272A] rounded-lg p-4 sm:p-5 shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-9 h-9 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono uppercase tracking-tight">
              Rootless Theos Hook Specifications & Architecture
            </h2>
            <p className="text-xs text-[#71717A] font-mono">
              CoreBrightness, Preferences PSSpecifier injection, and Control Center UI (iOS 15.0–16.7.x)
            </p>
          </div>
        </div>

        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Apple ties True Tone availability to hardware pairing validation between the display cover glass,
          ambient light sensor (ALS), and the motherboard's Secure Enclave / SysConfig partition. When an aftermarket
          screen replacement lacks serialized EEPROM data, iOS silently disables the True Tone feature and hides all UI switches.
          This tweak completely circumvents these checks by hooking private framework interfaces at the UI and daemon abstraction layers.
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: CoreBrightness Daemon */}
        <div className="bg-[#121214] border border-[#27272A] rounded-lg p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-orange-400 font-mono font-semibold text-xs uppercase tracking-wide">
            <Layers className="w-3.5 h-3.5" />
            <span>1. CoreBrightness (CBAdaptationClient)</span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            <code className="text-orange-300 font-mono">CoreBrightness.framework</code> is the system abstraction layer for display colorimetry and ALS processing.
            By hooking <code className="text-orange-300 font-mono">-[CBAdaptationClient supported]</code>, <code className="text-orange-300 font-mono">-[CBAdaptationClient isAvailable]</code>,
            and <code className="text-orange-300 font-mono">-[CBAdaptationClient isColorAdaptationAvailable]</code> to return <code className="text-green-400 font-mono font-bold">YES</code>,
            both iOS 15 and iOS 16 treat the hardware as fully capable without querying ALS calibration matrices.
          </p>
          <div className="bg-[#0A0A0C] p-2 rounded text-[11px] font-mono text-[#D4D4D8] border border-[#27272A] leading-tight">
            <span className="text-orange-400 font-bold">%hook</span> CBAdaptationClient<br />
            - (BOOL)supported &#123; <span className="text-orange-400">return</span> <span className="text-green-400 font-bold">YES</span>; &#125;<br />
            - (BOOL)isAvailable &#123; <span className="text-orange-400">return</span> <span className="text-green-400 font-bold">YES</span>; &#125;<br />
            <span className="text-orange-400 font-bold">%end</span>
          </div>
        </div>

        {/* Pillar 2: Preferences PSSpecifier */}
        <div className="bg-[#121214] border border-[#27272A] rounded-lg p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-purple-400 font-mono font-semibold text-xs uppercase tracking-wide">
            <Layers className="w-3.5 h-3.5" />
            <span>2. Settings App (Display & Brightness)</span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            In <code className="text-purple-300 font-mono">DisplayAndBrightnessSettingsController</code> (<code className="text-purple-300 font-mono">Preferences.framework</code>),
            the specifiers array is inspected. If iOS has stripped the True Tone specifier, we instantiate a dynamic <code className="text-purple-300 font-mono">PSSpecifier</code> of type <code className="text-purple-300 font-mono">PSSwitchCell</code> (cell type 6) with getter <code className="text-purple-300 font-mono">@selector(getFakeTrueTone:)</code> and setter <code className="text-purple-300 font-mono">@selector(setFakeTrueTone:specifier:)</code>.
          </p>
          <div className="bg-[#0A0A0C] p-2 rounded text-[11px] font-mono text-[#D4D4D8] border border-[#27272A] leading-tight">
            PSSpecifier *spec = [PSSpecifier preferenceSpecifierNamed:@"True Tone" ... cell:6 edit:Nil];<br />
            [spec setProperty:@"Automatically adapt iPhone display..." forKey:@"footerText"];
          </div>
        </div>

        {/* Pillar 3: Control Center UI */}
        <div className="bg-[#121214] border border-[#27272A] rounded-lg p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-sky-400 font-mono font-semibold text-xs uppercase tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            <span>3. SpringBoard Control Center</span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            When users 3D Touch or long-press the Brightness module, <code className="text-sky-300 font-mono">ControlCenterUI</code> loads <code className="text-sky-300 font-mono">CCUIContinuousSliderView</code> and queries <code className="text-sky-300 font-mono">CCUIExpandedModuleContinuousSliderProvider</code>.
            We hook <code className="text-sky-300 font-mono">-providesTrueTone</code> and <code className="text-sky-300 font-mono">-isTrueToneEnabled</code> to ensure the circular button renders and illuminates blue (<code className="text-sky-400 font-mono">#007AFF</code>) when toggled.
          </p>
          <div className="bg-[#0A0A0C] p-2 rounded text-[11px] font-mono text-[#D4D4D8] border border-[#27272A] leading-tight">
            <span className="text-orange-400 font-bold">%hook</span> CCUIExpandedModuleContinuousSliderProvider<br />
            - (BOOL)providesTrueTone &#123; <span className="text-orange-400">return</span> <span className="text-green-400 font-bold">YES</span>; &#125;<br />
            - (BOOL)isTrueToneEnabled &#123; <span className="text-orange-400">return</span> g_fakeTrueToneEnabled; &#125;<br />
            <span className="text-orange-400 font-bold">%end</span>
          </div>
        </div>

        {/* Pillar 4: Rootless & IPC */}
        <div className="bg-[#121214] border border-[#27272A] rounded-lg p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-green-400 font-mono font-semibold text-xs uppercase tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Dopamine Rootless & IPC Sync</span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Rootless jailbreaks (Dopamine, Palera1n) store tweak binaries and dylibs in <code className="text-green-400 font-mono">/var/jb/Library/MobileSubstrate/DynamicLibraries/</code>.
            To avoid sandbox crashes when reading preferences across sandboxed apps and unsandboxed daemons, we utilize <code className="text-green-400 font-mono">CFPreferencesSetAppValue()</code> combined with Darwin Notification Center (<code className="text-green-400 font-mono">notify_post</code>).
          </p>
          <div className="bg-[#0A0A0C] p-2 rounded text-[11px] font-mono text-[#D4D4D8] border border-[#27272A] leading-tight">
            CFPreferencesSetAppValue(kKey, @(enabled), kDomain);<br />
            CFPreferencesAppSynchronize(kDomain);<br />
            notify_post("com.developer.faketruetone.changed");
          </div>
        </div>
      </div>

      {/* Difference between iOS 15 and iOS 16 */}
      <div className="bg-[#121214] border border-[#27272A] rounded-lg p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-orange-400" />
          <span>iOS 15 vs. iOS 16 Internal API Discrepancies Handled</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#D4D4D8]">
          <div className="bg-[#0A0A0C] p-3 rounded border border-[#27272A] space-y-2 font-mono">
            <span className="font-semibold text-orange-400 block text-xs">iOS 15.0 – 15.7.x</span>
            <ul className="list-disc list-inside space-y-1 text-[#71717A] text-[11px]">
              <li>Directly invokes <code className="text-[#D4D4D8]">CBAdaptationClient -supported</code></li>
              <li>Settings controller delegates to <code className="text-[#D4D4D8]">PSSpecifier</code> dictionary indices</li>
              <li>CC module uses older <code className="text-[#D4D4D8]">CCUIContinuousSliderView</code> layout</li>
            </ul>
          </div>

          <div className="bg-[#0A0A0C] p-3 rounded border border-[#27272A] space-y-2 font-mono">
            <span className="font-semibold text-purple-400 block text-xs">iOS 16.0 – 16.7.x</span>
            <ul className="list-disc list-inside space-y-1 text-[#71717A] text-[11px]">
              <li>Introduces secondary checks on <code className="text-[#D4D4D8]">CBClient -isColorAdaptationAvailable</code></li>
              <li>Refactors CC expanded slider into <code className="text-[#D4D4D8]">CCUIExpandedModuleContinuousSliderProvider</code></li>
              <li>Stricter sandbox rules requiring <code className="text-[#D4D4D8]">CFPreferences</code> over direct file I/O</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
