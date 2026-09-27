/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';
import type { CheckRecord, ItemId } from '@shared/game/data';
import { getItem } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic';
import { CheckStatusIcon } from './CheckStatusIcon';
import { SwapBadge } from './SwapBadge';
import '../ChecksTracker.css';

interface TrackerCheckRowProps {
  check: CheckRecord;
  status: CheckStatus;
  detailed?: boolean;
  /** The item this row shows, already resolved by the caller (check-contents.ts). */
  item?: ItemId;
  /** A reversible event's live side: true while it holds. Undefined for every other record. */
  now?: boolean;
}

const TrackerCheckRow = (props: TrackerCheckRowProps) => {
  const { check, status, detailed, item: itemId, now } = props;
  const displayItem = itemId ? getItem(itemId).name : undefined;
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
