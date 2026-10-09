/* @layer shared-game @kind types */
interface ScreenBundleGrid {
  name: string;
  screens: number[];
  cols: number;
  rows: number;
  subNames: Record<number, string>;
  screenNames: Record<number, string>;
  isMulti: boolean;
  head: number;
  roomShape?: '2x2' | '2x1' | '1x2' | '1x1';
  activeQuadrant?: { x: number; y: number };
  effectiveLayout?: { width: number; height: number };
}

export type { ScreenBundleGrid };
