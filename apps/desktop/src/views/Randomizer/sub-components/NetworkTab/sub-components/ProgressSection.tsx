/* @layer renderer-components @kind component */
import { ProgressBar } from '@drizztdourden08/tessera/primitives';
import { NetworkSection } from './NetworkSection';
import { formatYesNo } from '../behavior/network-format';
import { NOT_CONNECTED_HINT } from '../behavior/network-view.constants';
import type { NetworkProgress } from '@app/game/randomizer-client';
import type { NetworkRow } from './NetworkSection.type';
import type { ProgressSectionProps } from './ProgressSection.type';

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
        <ProgressBar value={progress.checked} max={progress.total} tone="secondary" label="Locations checked" showValue />
      )}
    </NetworkSection>
  );
};

export { ProgressSection };
export type { ProgressSectionProps };
