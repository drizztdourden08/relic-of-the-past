/* @layer bridge-wasm @kind types */
interface Sdl2Audio {
  audioContext: AudioContext;
  scriptProcessorNode: AudioNode;
}

interface Sdl2ModuleAudio {
  audioContext?: AudioContext;
  audio?: { scriptProcessorNode?: AudioNode };
}

interface MasterAudioTarget {
  ctx: AudioContext;
  node: AudioNode;
}

export type { Sdl2Audio, Sdl2ModuleAudio, MasterAudioTarget };
