/* @layer renderer-components @kind types */
import type { PlayerSheet } from '@rotp/game-data';
import type { ResolvedRow } from '@app/lib/game/player-sheet/resolve-palette';

interface ContactSheetProps {
  sheet: PlayerSheet;
  row: ResolvedRow;
  tick: number;
  scale: number;
  onSelect: (action: number) => void;
}

export type { ContactSheetProps };
