/* @layer renderer-hud @kind types */
import type { ReactNode } from 'react';
import type { GearLadderKind, PauseSection } from '@shared/game/logic/pause';
import type { GearRowCell } from './sub-components/PauseGearRow';

/** The gear screen owns one section per ladder, plus the passive row. */
type GearSection = Extract<PauseSection, GearLadderKind | 'passive'>;

/** One ladder, already resolved to cells by the view. */
interface GearLadder {
  kind: GearLadderKind;
  section: GearSection;
  label: string;
  cells: readonly GearRowCell[];
}

interface PauseGearScreenProps {
  /** Blade, guard, armour and arrows, in the order the cursor walks them. The
   *  passive row is drawn under the last of them, so the count is free to grow. */
  ladders: readonly GearLadder[];
  /** Gloves, boots, flippers and the world charm. Each is held or not, never a tier. */
  passives: readonly GearRowCell[];
  passiveLabel: string;
  section: GearSection;
  cursor: number;
  /** What this row offers, or why a faded tier cannot be chosen. The view
   *  has already wrapped it to the portrait column. */
  hintLines: readonly string[];
  hero: ReactNode;
  scale: number;
  spritesBase: string;
  /** Clicking a cell moves the cursor there. */
  onFocusTier: (section: GearSection, cursor: number) => void;
  /**
   * Firing the cell the cursor is now on. This is the pad's confirm, from a pointer.
   * Whether that equips anything, and whether the tier is even reachable, is
   * decided where the pad's own confirm is decided; this screen only reports
   * the press.
   */
  onConfirm: () => void;
}

export type { GearLadder, GearSection, PauseGearScreenProps };
