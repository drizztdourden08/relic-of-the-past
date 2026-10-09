/* @layer shared-types @kind types */
interface GraphicsSettings {
  windowScale: number;
  fullscreen: 0 | 1 | 2;
  newRenderer: boolean;
  enhancedMode7: boolean;
  noSpriteLimits: boolean;
  linearFiltering: boolean;
  dimFlashes: boolean;
  linkSprite: string | null;
  outputMethod: 'SDL' | 'SDL-Software' | 'OpenGL' | 'OpenGL ES';
  windowMode: 'default' | 'borderless';
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
