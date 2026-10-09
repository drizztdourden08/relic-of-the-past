/* @layer shared-types @kind types */
import type { HudContainer } from '../hud-node';

type HudScreenRoot = HudContainer;

type HudClusterReveal = 'always' | 'on-change' | 'never';

interface HudLayout {
  id: string;
  name: string;
  builtIn: boolean;
  basedOn?: string;
  glyphPack?: string;
  inGameplay?: HudClusterReveal;
  screen: HudScreenRoot;
}

export type { HudClusterReveal, HudLayout, HudScreenRoot };
