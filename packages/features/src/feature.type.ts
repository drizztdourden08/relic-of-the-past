/* @layer shared @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';

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
  label: Message;
  description: string;
  userMessage: Message;
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
