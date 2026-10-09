/* @layer renderer-lib @kind types */
import type { ReportContext } from '@shared/sanctuary';
import type { GameScreenId } from '@shared/game/logic/queries/game-id';
import type { GameUIState } from '@shared/game/types';

interface ReportContextResult {
  context: ReportContext;
  gameId: GameScreenId | null;
  subject: string;
}

type MapSlice = Pick<GameUIState['map'], 'isIndoors' | 'roomIndex' | 'palaceIndex' | 'overworldScreenIndex'>;

export type { ReportContextResult, MapSlice };
