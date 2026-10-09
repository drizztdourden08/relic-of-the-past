/* @layer renderer-components @kind types */
import type { PlayerSheet } from '@rotp/game-data';
import type { ResolvedRow } from '@rotp/packs';

interface ContactSheetProps {
  sheet: PlayerSheet;
  row: ResolvedRow;
  tick: number;
  scale: number;
  onSelect: (action: number) => void;
}

export type { ContactSheetProps };
