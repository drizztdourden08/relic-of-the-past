/* @layer renderer-widgets @kind hook */
import { useEffect, useMemo, useRef } from 'react';
import { useGameUIStore } from '../../../stores/game-ui-store';
import { describePalaceMismatch, resolveCurrentScreenDetailed } from '@rotp/game-data';
import type { ScreenMatchResult, VariantGameState } from '@rotp/game-data';
import { log } from '@app/log-bus';
import { wasmGetProgressIndicator } from '../../../game';
import { getCompletedChecks } from '../../../game/tracker';

const useScreenDetection = (debugTick?: number): ScreenMatchResult | null => {
  const { overworldScreenIndex, roomIndex, isIndoors, palaceIndex, whichEntrance } = useGameUIStore(s => s.map);

  const progressInfo = wasmGetProgressIndicator();
  const variantState = useMemo<VariantGameState>(() => ({
    completedChecks: getCompletedChecks(),
    entranceId: whichEntrance,
    progressTier: progressInfo?.tier,
  }), [whichEntrance, progressInfo?.tier, debugTick]);

  const match = useMemo<ScreenMatchResult | null>(
    () => resolveCurrentScreenDetailed({ isIndoors, palaceIndex, roomIndex, overworldScreenIndex, whichEntrance, variantState }),
    [isIndoors, palaceIndex, roomIndex, overworldScreenIndex, whichEntrance, variantState],
  );

  const warned = useRef(new Set<string>());
  useEffect(() => {
    if (match === null) return;
    const mismatch = match.palaceMismatch;
    if (!mismatch) return;
    const key = `${mismatch.actual}:${match.screen.gameId.roomIndex}`;
    if (warned.current.has(key)) return;
    warned.current.add(key);
    log.app(describePalaceMismatch({ ...mismatch, room: match.screen.gameId.roomIndex ?? -1, screenId: match.screen.id }), 'warn');
  }, [match]);

  return match;
};

export { useScreenDetection };
