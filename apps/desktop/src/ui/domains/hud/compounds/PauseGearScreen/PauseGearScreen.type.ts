/* @layer renderer-hud @kind types */
import type { ReactNode } from 'react';
import type { GearLadderKind, PauseSection } from '@rotp/game-data';
import type { GearRowCell } from './sub-components/PauseGearRow';

type GearSection = Extract<PauseSection, GearLadderKind | 'passive'>;

interface GearLadder {
  kind: GearLadderKind;
  section: GearSection;
  label: string;
  cells: readonly GearRowCell[];
}

interface PauseGearScreenProps {
  ladders: readonly GearLadder[];
  passives: readonly GearRowCell[];
  passiveLabel: string;
  section: GearSection;
  cursor: number;
  hintLines: readonly string[];
  hero: ReactNode;
  scale: number;
  spritesBase: string;
  onFocusTier: (section: GearSection, cursor: number) => void;
  onConfirm: () => void;
}

export type { GearLadder, GearSection, PauseGearScreenProps };
