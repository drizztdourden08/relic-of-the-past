/**
 * Edge Glow Renderer types.
 */

interface EdgeGlowRenderer {
  render(gameCanvas: HTMLCanvasElement, time: number, cleanFrame?: { data: Uint8Array; width: number; height: number } | null): void;
  resize(width: number, height: number): void;
  setEnabled(enabled: boolean): void;
  setBlackBounds(left: number, right: number, bottom: number): void;
  setMaxBounds(left: number, right: number, bottom: number): void;
  setEffectOpacity(opacity: number): void;
  dispose(): void;
}

interface EdgeGlowOptions {
  blurRadius?: number;
  glowIntensity?: number;
  noiseSpeed?: number;
  noiseScale?: number;
  blurPasses?: number;
}

export type { EdgeGlowRenderer, EdgeGlowOptions };
