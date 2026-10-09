/* @layer bridge-wasm @kind types */
import type { ScreenShadowData } from '@shared/types/shadow-casting';

interface ShadowRenderer {
  render(gameCanvas: HTMLCanvasElement, time: number): void;
  setScreenData(data: ScreenShadowData | null): void;
  setScreenOrigin(viewLeft: number, viewTop: number, snesWidth: number, snesHeight: number): void;
  resize(width: number, height: number): void;
  setEnabled(enabled: boolean): void;
  setDebugMode(debug: boolean): void;
  dispose(): void;
}

interface ShadowRendererOptions {
  shadowSoftness?: number;
}

export type { ShadowRenderer, ShadowRendererOptions };
