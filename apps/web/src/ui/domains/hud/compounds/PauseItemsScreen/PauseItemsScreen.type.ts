/* @layer renderer-hud @kind types */
import type { ReactNode } from 'react';
import type { ItemCell, PauseSection } from '@shared/game/logic/pause';

/** The two sections the items screen owns. */
type ItemsSection = Extract<PauseSection, 'items' | 'bottles'>;

interface PauseItemsScreenProps {
  /** The twenty inventory cells, in hud-item order. */
  items: readonly ItemCell[];
  /** The four bottle cells. */
  bottles: readonly ItemCell[];
  /** Which of the two sections holds the cursor. */
  section: ItemsSection;
  cursor: number;
  /** The selected item's localized name, already folded and wrapped by the view. */
  nameLines: readonly string[];
  /** The hint under the name (the standing invitation, or a refusal), already
   *  wrapped to the portrait column by the view. */
  hintLines: readonly string[];
  /** The portrait, built by the view so this stays free of sheets and palettes. */
  hero: ReactNode;
  scale: number;
  spritesBase: string;
  /** Clicking a cell moves the cursor; assignment is a separate press. */
  onFocusCell: (section: ItemsSection, cursor: number) => void;
}

export type { ItemsSection, PauseItemsScreenProps };
