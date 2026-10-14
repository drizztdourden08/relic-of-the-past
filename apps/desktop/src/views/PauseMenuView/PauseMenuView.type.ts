/* @layer renderer-hud @kind types */
import type { RefObject } from 'react';
import type { PauseLabelKey } from '@rotp/languages';
import type { PauseMenuData } from '../../hooks/hooks.type';

type ItemNameKey = { recordId: string; tier: number };

type LocalizedNames = {
  itemName: (recordId: string, tier: number) => string;
  bottleName: (content: number) => string;
  label: (key: PauseLabelKey) => string;
};

type NameGrid = { maxCols: number; maxLines: number };

interface PauseMenuViewProps {
  slideTransform?: string;
  slideTransition?: string;
}

type BottlePhase = 'hidden' | 'expanding' | 'visible' | 'collapsing';

interface MenuScale {
  containerRef: RefObject<HTMLDivElement | null>;
  scale: number;
}

interface BottlePhaseState {
  phase: BottlePhase;
  showBottlePanel: boolean;
  showNormalPanels: boolean;
  onAnimationEnd: () => void;
}

interface MenuSelection {
  displayItems: number[];
  selectedSaveIdx: number;
  isBottleSelected: boolean;
  bottleSlot: number;
  nameLines: string[];
  itemSprite: string | null;
  abilityFlags: number;
}

interface BottleColumnProps {
  data: PauseMenuData;
  bottleSlot: number;
  bottle: BottlePhaseState;
  scale: number;
  spritesBase: string;
}

interface StatusPanelsProps {
  data: PauseMenuData;
  scale: number;
  spritesBase: string;
}

export type {
  BottleColumnProps, BottlePhase, BottlePhaseState, ItemNameKey, LocalizedNames, MenuScale, MenuSelection, NameGrid,
  PauseMenuViewProps, StatusPanelsProps,
};
