/* @layer renderer-lib @kind types */
import type { ReportContext } from '@shared/sanctuary';
import type { GameScreenId } from '@rotp/game-data';
import type { GameUIState } from '@rotp/game-data';

interface ReportContextResult {
  context: ReportContext;
  gameId: GameScreenId | null;
  subject: string;
}

type MapSlice = Pick<GameUIState['map'], 'isIndoors' | 'roomIndex' | 'palaceIndex' | 'overworldScreenIndex'>;

export type { ReportContextResult, MapSlice };
