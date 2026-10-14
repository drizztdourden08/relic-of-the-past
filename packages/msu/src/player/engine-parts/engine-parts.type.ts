/* @layer renderer-lib @kind types */
interface EngineVolumes {
  music: () => number;
  ambient: () => number;
  sfx: () => number;
}

interface EngineGains {
  musicGain: GainNode;
  ambientGain: GainNode;
  sfxGain: GainNode;
  sync: () => void;
  disconnect: () => void;
}

export type { EngineGains, EngineVolumes };
