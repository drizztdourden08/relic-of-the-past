/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';
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
        <Text className={`tracker-check__now tracker-check__now--${now ? 'on' : 'off'}`}>{now ? 'now' : 'not now'}</Text>
      )}
      <SwapBadge check={check} shown={itemId} />
      <Text className="tracker-check__type">{check.kind}</Text>
    </Box>
  );
};

export { TrackerCheckRow };
