/* @layer renderer-lib @kind logic */
/**
 * What the renderer itself can see: the graphics stack WebGL exposes, the audio
 * device the mixer will land on, the display the window currently sits on, and the
 * input devices attached right now. Available on every host, including the web and
 * mobile builds where there is no main process to ask.
 */

interface WebglDiagnostics {
  version: 1 | 2;
  vendor: string;
  renderer: string;
  glVersion: string;
  shadingLanguage: string;
  maxTextureSize: number;
  maxViewport: string;
  maxRenderBufferSize: number;
  antialias: boolean;
  failIfMajorPerformanceCaveat: boolean;
}

interface AudioDiagnostics {
  sampleRate: number;
  baseLatencyMs: number | null;
  outputLatencyMs: number | null;
  maxChannels: number;
  state: string;
}

interface DisplayEnvironment {
  screen: { width: number; height: number; availWidth: number; availHeight: number };
  nativeScreen: { width: number; height: number };
  viewport: { width: number; height: number };
  colorDepth: number;
  pixelDepth: number;
  devicePixelRatio: number;
  orientation: string | null;
  colorScheme: string;
  colorGamut: string;
  hdr: boolean;
  reducedMotion: boolean;
  refreshHz: number | null;
}

interface DeviceEnvironment {
  logicalCores: number | null;
  deviceMemoryGb: number | null;
  jsHeap: { usedBytes: number; totalBytes: number; limitBytes: number } | null;
  maxTouchPoints: number;
  languages: string[];
  timeZone: string;
  online: boolean;
  /** One entry per connected gamepad, as the Gamepad API names it. */
  gamepads: string[];
}

interface RendererDiagnostics {
  webgl: WebglDiagnostics | null;
  audio: AudioDiagnostics | null;
  display: DisplayEnvironment;
  device: DeviceEnvironment;
}

export type {
  WebglDiagnostics,
  AudioDiagnostics,
  DisplayEnvironment,
  DeviceEnvironment,
  RendererDiagnostics,
};
