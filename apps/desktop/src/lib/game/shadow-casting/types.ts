import type { ScreenShadowData } from '@shared/types/shadow-casting';

interface ShadowRenderer {
  /** Render shadow/lighting composite for the current frame */
  render(gameCanvas: HTMLCanvasElement, time: number): void;
  /** Update the screen data (called on screen transitions) */
  setScreenData(data: ScreenShadowData | null): void;
  /** Set the viewport origin and size (called every frame for correct world-space alignment) */
  setScreenOrigin(viewLeft: number, viewTop: number, snesWidth: number, snesHeight: number): void;
  /** Resize internal buffers to match game canvas */
  resize(width: number, height: number): void;
  /** Enable/disable rendering */
  setEnabled(enabled: boolean): void;
  /** Toggle debug visualization mode */
  setDebugMode(debug: boolean): void;
  /** Clean up GL resources */
  dispose(): void;
}

interface ShadowRendererOptions {
  /** Override shadow softness (0–1) */
  shadowSoftness?: number;
}

export type { ShadowRenderer, ShadowRendererOptions };
