export interface TweakFile {
  name: string;
  path: string;
  language: 'makefile' | 'objective-c' | 'xml' | 'shell' | 'debian' | 'markdown';
  description: string;
  content: string;
}

export interface SimulatedLog {
  id: string;
  timestamp: string;
  process: 'CoreBrightness' | 'SpringBoard' | 'Preferences' | 'PreferencesSync';
  level: 'info' | 'hook' | 'pref' | 'warn';
  message: string;
}

export interface TweakState {
  trueToneEnabled: boolean;
  darkMode: boolean;
  nightShift: boolean;
  brightness: number; // 0 to 100
  iosVersion: '15.4' | '16.5';
  jailbreakEnv: 'Dopamine 2.x' | 'Palera1n Rootless';
}
