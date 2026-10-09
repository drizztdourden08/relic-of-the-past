/* @layer renderer-components @kind component */
import { ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
import { useTrackerData } from '../../../../../../hooks/useTrackerData';
import { checkCountsOf } from '../behavior/run-progress';
import { percentOf } from '../behavior/checks-percent';
import type { CheckCounts } from '../behavior/run-progress.type';
import type { RunTile } from '../behavior/run-tile.type';
import type { NetworkProgress } from '@app/lib/game/randomizer-client';
import { DashboardCard } from './DashboardCard';
import { StatTiles } from './StatTiles';
import type { RunProgressProps } from './RunProgress.type';

const checkTilesOf = (counts: CheckCounts): RunTile[] => {
  const tiles: RunTile[] = [{ label: 'checks taken', value: `${counts.taken} of ${counts.total}` }];
  if (counts.available !== null) tiles.push({ label: 'available', value: String(counts.available) });
  if (counts.left !== null) tiles.push({ label: 'left', value: String(counts.left) });
  return tiles;
};

const roomTilesOf = (room: NetworkProgress): RunTile[] => [
  { label: 'items received', value: String(room.itemsReceived) },
  { label: 'items sent', value: String(room.itemsSentToOthers) },
  { label: 'goal', value: room.goalReported ? 'complete' : 'not yet', tone: room.goalReported ? 'success' : undefined },
];

const RunProgress = ({ placement, room }: RunProgressProps) => {
  const { stats, placement: seedPlacement } = useTrackerData();
  const counts = checkCountsOf(seedPlacement ? stats : null, room);
  const tiles = [...(counts === null ? [] : checkTilesOf(counts)), ...(room === null ? [] : roomTilesOf(room))];

  return (
    <DashboardCard placement={placement} title="Progress">
      {counts === null ? (
        <Text className="randomizer-page__hint">The progress shows once the game boots and the session loads the seed.</Text>
      ) : (
        <ProgressBar
          value={counts.taken}
          secondaryValue={counts.available === null ? undefined : counts.taken + counts.available}
          secondaryTone="primary"
          tone="secondary"
          max={Math.max(counts.total, 1)}
          label="Checks taken"
          showValue
          formatValue={() => `${percentOf(counts)}%`}
        />
      )}
      {tiles.length > 0 && <StatTiles tiles={tiles} />}
    </DashboardCard>
  );
};

export { RunProgress };
export type { RunProgressProps };
