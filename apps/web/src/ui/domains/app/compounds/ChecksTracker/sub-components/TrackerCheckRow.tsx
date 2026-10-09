/* @layer renderer-components @kind component */
import { Box, Status, Text } from '@drizztdourden08/tessera/primitives';
import { getItem } from '@shared/game/data';
import { CheckStatusIcon } from './CheckStatusIcon';
import { SwapBadge } from './SwapBadge';
import type { TrackerCheckRowProps } from '../ChecksTracker.type';
import '../ChecksTracker.css';

const TrackerCheckRow = (props: TrackerCheckRowProps) => {
  const { check, status, detailed, item, foreignItem, now } = props;
  const itemId = foreignItem === undefined ? item : undefined;
  const displayItem = foreignItem ?? (itemId ? getItem(itemId).name : undefined);
  return (
    <Box className={`tracker-check tracker-check--${status}`}>
      <CheckStatusIcon status={status} size={11} />
      <Text className="tracker-check__name">{check.name}</Text>
      {detailed && (
        <Text className="tracker-check__item">{displayItem ?? '-'}</Text>
      )}
      {now !== undefined && (now || status === 'completed') && (
        <Status tone={now ? 'success' : 'neutral'} variant="pill">{now ? 'now' : 'not now'}</Status>
      )}
      <SwapBadge check={check} shown={itemId} />
      <Text className="tracker-check__type">{check.kind}</Text>
    </Box>
  );
};

export { TrackerCheckRow };
