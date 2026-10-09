/* @layer renderer-hud @kind types */
import type { PauseLabelKey } from '@rotp/languages';

type ItemNameKey = { recordId: string; tier: number };

type LocalizedNames = {
  itemName: (recordId: string, tier: number) => string;
  bottleName: (content: number) => string;
  label: (key: PauseLabelKey) => string;
};

type NameGrid = { maxCols: number; maxLines: number };

export type { ItemNameKey, LocalizedNames, NameGrid };
