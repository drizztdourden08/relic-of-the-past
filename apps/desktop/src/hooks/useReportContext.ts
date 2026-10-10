/* @layer renderer-lib @kind hook */
import { useMemo } from 'react';
import type { GameScreenId, GameUIState } from '@rotp/game-data';
import { screenIdForGameId } from '@rotp/game-data';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useDebugTextBuilder } from './useDebugTextBuilder';
import { buildReportSubject } from '../diagnostics/build-report-subject';
import type { MapSlice, ReportContextResult } from './report-context.type';
import { NOT_ON_A_SCREEN, NO_PALACE } from './report-context.constants';

const gameIdOf = (mode: GameUIState['mode'], map: MapSlice): GameScreenId | null => {
  if (NOT_ON_A_SCREEN.has(mode)) return null;
  if (!map.isIndoors) return { kind: 'overworld', screen: map.overworldScreenIndex };
  return map.palaceIndex === NO_PALACE
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
