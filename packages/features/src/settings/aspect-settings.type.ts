/* @layer shared-types @kind types */
type OffscreenEnemyMode = 'idle' | 'vanilla' | 'paused';

interface AspectSettings {
  extendedRendering: boolean;
  aspectRatio: 'original' | 'auto' | 'screen' | '4:3' | '3:2' | '16:9' | '16:10' | '21:9' | '32:9' | '4:5' | '3:4' | 'custom';
  customAspectW: number;
  customAspectH: number;
  extendY: boolean;
  widescreenSprites: boolean;
  widescreenVisualFixes: boolean;
  linearWorldTilemap?: boolean;
  ultrawideRendering?: boolean;
  tallRendering?: boolean;
  cameraLockToViewport: boolean;
  smoothTransitions?: boolean;
  widescreenPlayArea?: boolean;
  offscreenAI?: OffscreenEnemyMode;
}

export type { AspectSettings, OffscreenEnemyMode };
