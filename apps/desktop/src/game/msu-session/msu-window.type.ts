/* @layer bridge-wasm @kind types */
declare global {
  interface Window {
    __onMusicCtrl?: (ctrl: number, module: number, entrance: number, overworldArea: number) => void;
    __onGameSound?: (channel: number, id: number, pan: number) => void;
    __msuIsPlaying?: (ctrl: number, module: number, entrance: number, overworldArea: number) => boolean;
    __onSoundTrace?: (channel: number, id: number, pan: number, claimed: number) => void;
    __onMusicTrace?: (ctrl: number, module: number, external: number) => void;
  }
}

export {};
