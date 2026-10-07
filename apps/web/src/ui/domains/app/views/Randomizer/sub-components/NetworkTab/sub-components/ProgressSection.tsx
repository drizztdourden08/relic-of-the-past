/* @layer renderer-components @kind component */
/** This slot's side of the run: its locations, the items in and out, and the goal. */
import { ProgressBar } from '@ds/primitives';
import { NetworkSection } from './NetworkSection';
import { formatYesNo } from '../behavior/network-format';
import { NOT_CONNECTED_HINT } from '../behavior/network-view';
import type { NetworkProgress } from '@app/lib/game/randomizer-client';
import type { NetworkRow } from './NetworkSection';
import type { NetworkView } from '../behavior/network-view';
import type { PanelPlacement } from '../../../Randomizer.constants';

interface ProgressSectionProps {
  placement: PanelPlacement;
  view: NetworkView;
}

const progressRows = (progress: NetworkProgress): NetworkRow[] => [
  { label: 'locations', value: `${progress.checked} / ${progress.total}` },
  { label: 'items received', value: progress.itemsReceived },
  { label: 'items sent', value: progress.itemsSentToOthers },
  { label: 'goal reported', value: formatYesNo(progress.goalReported) },
];

const ProgressSection = ({ placement, view }: ProgressSectionProps) => {
  const progress = view.status?.progress ?? null;
  return (
    <NetworkSection
      placement={placement}
      title="Progress"
      chip={view.live ? undefined : view.offline}
      rows={progress === null ? null : progressRows(progress)}
      empty={NOT_CONNECTED_HINT}
    >
      {progress !== null && progress.total > 0 && (
        <ProgressBar value={progress.checked} max={progress.total} variant="green" readout={`${Math.round((progress.checked / progress.total) * 100)}%`} />
      )}
    </NetworkSection>
  );
};

export { ProgressSection };
export type { ProgressSectionProps };
