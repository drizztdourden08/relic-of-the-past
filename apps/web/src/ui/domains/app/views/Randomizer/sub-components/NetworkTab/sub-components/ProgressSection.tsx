/* @layer renderer-components @kind component */
/** This slot's side of the run: its locations, the items in and out, and the goal. */
import { ProgressBar } from '@ds/primitives';
import { NetworkSection } from './NetworkSection';
import { formatYesNo } from '../behavior/network-format';
import type { NetworkProgress } from '@app/lib/game/randomizer-client';
import type { NetworkRow } from './NetworkSection';

interface ProgressSectionProps {
  progress: NetworkProgress;
}

const progressRows = (progress: NetworkProgress): NetworkRow[] => [
  { label: 'locations', value: `${progress.checked} / ${progress.total}` },
  { label: 'items received', value: progress.itemsReceived },
  { label: 'items sent', value: progress.itemsSentToOthers },
  { label: 'goal reported', value: formatYesNo(progress.goalReported) },
];

const ProgressSection = ({ progress }: ProgressSectionProps) => (
  <NetworkSection title="Progress" rows={progressRows(progress)}>
    {progress.total > 0 && <ProgressBar value={progress.checked} max={progress.total} variant="green" />}
  </NetworkSection>
);

export { ProgressSection };
export type { ProgressSectionProps };
