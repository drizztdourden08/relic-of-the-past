import { useMemo } from 'react';
import { useGameUIStore } from '../../../stores/game-ui-store';
import { resolveCurrentScreenDetailed } from '@shared/game/data/screens';
import type { ScreenMatchResult, VariantGameState } from '@shared/game/data/screens';
import { wasmGetProgressIndicator } from '../../../lib/game';
import { getCompletedChecks } from '../../../lib/game/tracker';

const useScreenDetection = (debugTick?: number): ScreenMatchResult | null => {
  const { overworldScreenIndex, roomIndex, isIndoors, palaceIndex, whichEntrance } = useGameUIStore(s => s.map);

  const progressInfo = wasmGetProgressIndicator();
  const variantState = useMemo<VariantGameState>(() => ({
    completedChecks: getCompletedChecks(),
    entranceId: whichEntrance ?? undefined,
    progressTier: progressInfo?.tier,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [whichEntrance, progressInfo?.tier, debugTick]);

  return useMemo<ScreenMatchResult | null>(
    () => resolveCurrentScreenDetailed(isIndoors, palaceIndex, roomIndex, overworldScreenIndex, whichEntrance, variantState),
    [isIndoors, palaceIndex, roomIndex, overworldScreenIndex, whichEntrance, variantState],
  );
};

export { useScreenDetection };
