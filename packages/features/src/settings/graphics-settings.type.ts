/* @layer shared-types @kind types */
interface GraphicsSettings {
  newRenderer: boolean;
  enhancedMode7: boolean;
  noSpriteLimits: boolean;
  linearFiltering: boolean;
  dimFlashes: boolean;
  linkSprite: string | null;
  windowMode: 'windowed' | 'borderless' | 'fullscreen';
  displayMonitor: string;
  syncedRateInFullscreen: boolean;
  syncedRateTargetHz: number;
  startFullscreen: boolean;
  viewportConstraint: 'none' | 'fit' | 'fill';
  pixelPerfect: boolean;
  renderIntoNotch: boolean;
  overworldEdgeEffect: boolean;
  postProcessingShadows: boolean;
  hideSpaceBeyondWalls: boolean;
  coloredRupees: boolean;
  itemSheen: boolean;
}

export type { GraphicsSettings };
