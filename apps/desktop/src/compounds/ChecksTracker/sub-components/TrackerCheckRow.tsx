/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { displayItemOf } from '../behavior/display-item';
import type { TrackerCheckRowProps } from '../ChecksTracker.type';
import { CheckStatusIcon } from './CheckStatusIcon';
import { NowPill } from './NowPill';
import { SwapBadge } from './SwapBadge';
import './TrackerCheckRow.css';

const TrackerCheckRow = (props: TrackerCheckRowProps) => {
  const { check, status, detailed, item, foreignItem, now } = props;
  const { shownId, name } = displayItemOf(item, foreignItem);
  return (
    <Box className={`tracker-check tracker-check--${status}`}>
      <CheckStatusIcon status={status} size={11} />
      <Text className="tracker-check__name">{check.name}</Text>
      {detailed && (
        <Text className="tracker-check__item">{name ?? '-'}</Text>
      )}
      <NowPill now={now} status={status} />
      <SwapBadge check={check} shown={shownId} />
      <Text className="tracker-check__type">{check.kind}</Text>
    </Box>
  );
};

export { TrackerCheckRow };
