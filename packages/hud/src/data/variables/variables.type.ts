/* @layer shared-hud @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { HUD_SCOPE_EXTRAS } from './variables-table.constants';

interface HudVariableDef {
  name: string;
  note: Message;
}

type HudScopeExtra = (typeof HUD_SCOPE_EXTRAS)[number];

interface HudVitalsSource {
  healthCurrent: number;
  healthCapacity: number;
  magic: number;
  halfMagic: boolean;
  armor: number;
  arrows: number;
  maxArrows: number;
  bombs: number;
  maxBombs: number;
  keys: number;
  rupees: number;
  maxRupees: number;
  hasSilverArrows: boolean;
}

interface HudCountdownSource {
  active: boolean;
  seconds: number;
  frames: number;
}

export type { HudCountdownSource, HudScopeExtra, HudVariableDef, HudVitalsSource };
