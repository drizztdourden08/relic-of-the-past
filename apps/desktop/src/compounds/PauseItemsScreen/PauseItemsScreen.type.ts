/* @layer renderer-hud @kind types */
import type { ReactNode } from 'react';
import type { ItemCell, PauseSection } from '@rotp/game-data';

type ItemsSection = Extract<PauseSection, 'items' | 'bottles'>;

interface PauseItemsScreenProps {
  items: readonly ItemCell[];
  bottles: readonly ItemCell[];
  section: ItemsSection;
  cursor: number;
  nameLines: readonly string[];
  hintLines: readonly string[];
  hero: ReactNode;
  scale: number;
  spritesBase: string;
  onFocusCell: (section: ItemsSection, cursor: number) => void;
}

interface ItemsSideColumnsProps {
  nameLines: readonly string[];
  hintLines: readonly string[];
  hero: ReactNode;
  scale: number;
  spritesBase: string;
}

export type { ItemsSection, ItemsSideColumnsProps, PauseItemsScreenProps };
