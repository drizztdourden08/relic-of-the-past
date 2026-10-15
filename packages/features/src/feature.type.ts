/* @layer shared @kind types */
type FeatureKind =
  | 'features0-bit'
  | 'render-geometry'
  | 'ppu-render-flag'
  | 'host-event'
  | 'cheat'
  | 'dev';

type FeatureGroup =
  | 'Display / Aspect'
  | 'Display / HUD'
  | 'HUD'
  | 'Audio'
  | 'Input'
  | 'Quality of life'
  | 'Dialog'
  | 'Bug fixes'
  | 'Cheats'
  | 'Dev';

type FeatureOrigin = 'snesrev' | 'relic';

interface FeatureDef {
  id: string;
  label: string;
  description: string;
  userMessage: string;
  group: FeatureGroup;
  kind: FeatureKind;
  origin: FeatureOrigin;
  bundleOrigin?: 'MiscBugFixes' | 'GameChangingBugFixes' | 'WidescreenVisualFixes';
  flag?: string;
  word?: number;
  bit?: number;
  default: boolean;
  requires: string[];
  suggests?: string[];
  affectsVanillaParity: boolean;
  live: boolean;
}

export type { FeatureDef };
