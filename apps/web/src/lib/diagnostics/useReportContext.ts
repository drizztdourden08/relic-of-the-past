/* @layer renderer-lib @kind hook */
/**
 * What a report says about the moment it was filed: version, platform, and the screen the
 * game is on. The running flag lives in the app's lifecycle hook, not a store, so the
 * game-ui store's mode stands in for it: 'title' and 'loading' are what the store holds
 * before a game runs and while one boots, and neither is a screen worth naming.
 */
import { useMemo } from 'react';
import type { ReportContext } from '@shared/sanctuary';
import type { GameScreenId } from '@shared/game/logic/queries/game-id';
import { screenIdForGameId } from '@shared/game/logic/queries/game-id';
import type { GameUIState } from '@shared/game/types';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useDebugTextBuilder } from './useDebugTextBuilder';
import { buildReportSubject } from './build-report-subject';

interface ReportContextResult {
  context: ReportContext;
  gameId: GameScreenId | null;
  /** The prefilled subject, ready to finish. */
  subject: string;
}

const NOT_ON_A_SCREEN: ReadonlySet<GameUIState['mode']> = new Set(['title', 'loading']);

type MapSlice = Pick<GameUIState['map'], 'isIndoors' | 'roomIndex' | 'palaceIndex' | 'overworldScreenIndex'>;

const gameIdOf = (mode: GameUIState['mode'], map: MapSlice): GameScreenId | null => {
  if (NOT_ON_A_SCREEN.has(mode)) return null;
  if (!map.isIndoors) return { kind: 'overworld', screen: map.overworldScreenIndex };
  return map.palaceIndex === 0xff
    ? { kind: 'room', room: map.roomIndex }
    : { kind: 'room', room: map.roomIndex, palace: map.palaceIndex };
};

const useReportContext = (): ReportContextResult => {
  const { version, osLabel } = useDebugTextBuilder();
  const mode = useGameUIStore((s) => s.mode);
  const isIndoors = useGameUIStore((s) => s.map.isIndoors);
  const roomIndex = useGameUIStore((s) => s.map.roomIndex);
  const palaceIndex = useGameUIStore((s) => s.map.palaceIndex);
  const overworldScreenIndex = useGameUIStore((s) => s.map.overworldScreenIndex);

  return useMemo(() => {
    const gameId = gameIdOf(mode, { isIndoors, roomIndex, palaceIndex, overworldScreenIndex });
    const appVersion = version || '-';
    return {
      gameId,
      subject: buildReportSubject({ version: appVersion, gameId }),
      context: { appVersion, platform: osLabel, screenId: gameId ? screenIdForGameId(gameId) : null },
    };
  }, [version, osLabel, mode, isIndoors, roomIndex, palaceIndex, overworldScreenIndex]);
};

export { useReportContext };
export type { ReportContextResult };
