/* @layer bridge-wasm @kind types */
type MusicDebugOwner = 'pack' | 'chip' | 'skipped';

interface MusicDebugEvent {
  id: number;
  at: number;
  channel: 'music' | 'ambient' | 'sfx1' | 'sfx2';
  detail: string;
  owner: MusicDebugOwner;
}

interface MusicDebugCounter {
  key: string;
  channel: string;
  label: string;
  raised: number;
  pack: number;
  chip: number;
  skipped: number;
  lastAt: number;
}

type MusicDebugState = {
  nextId: number;
  events: MusicDebugEvent[];
  counters: Map<string, MusicDebugCounter>;
  listeners: Set<() => void>;
  armed: boolean;
  installed: boolean;
  countersSnapshot: MusicDebugCounter[];
  countersDirtyAt: number;
};

declare global {
  interface Window {
    __onSoundTrace?: (channel: number, id: number, pan: number, claimed: number) => void;
    __onMusicTrace?: (ctrl: number, module: number, external: number) => void;
  }
}

export type { MusicDebugCounter, MusicDebugEvent, MusicDebugOwner, MusicDebugState };
