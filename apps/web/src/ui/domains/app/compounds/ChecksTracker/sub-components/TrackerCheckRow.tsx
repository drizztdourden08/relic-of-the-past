/* @layer renderer-components @kind component */
import { Box, Text } from '@ds/primitives';
import type { CheckRecord, ItemId } from '@shared/game/data';
import { getItem } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic/eval';
import type { RunContext } from '@shared/game/logic/queries/check-grouping';
import { checkDisplayName } from '@app/lib/game/randomizer-client';
import { CheckStatusIcon } from './CheckStatusIcon';
import '../ChecksTracker.css';

interface TrackerCheckRowProps {
  check: CheckRecord;
  status: CheckStatus;
  detailed?: boolean;
  /** Override the displayed item (used when expanding multi-item checks) */
  itemOverride?: ItemId;
  /** With a run loaded, the check shows what it actually holds this seed. */
  run?: RunContext;
  /** A reversible event's live side: true while it holds. Undefined for every other record. */
  now?: boolean;
}

const TrackerCheckRow = (props: TrackerCheckRowProps) => {
  const { check, status, detailed, itemOverride, run, now } = props;
  const itemId = itemOverride ?? run?.placedItems?.get(check.id) ?? check.vanillaItemIds[0];
  const displayItem = itemId ? getItem(itemId).randomizerName : undefined;
  return (
    <Box className={`tracker-check tracker-check--${status}`}>
      <CheckStatusIcon status={status} size={11} />
      <Text className="tracker-check__name">{checkDisplayName(check)}</Text>
      {detailed && (
        <Text className="tracker-check__item">{displayItem ?? '-'}</Text>
      )}
      {now !== undefined && (
        <Text className={`tracker-check__now tracker-check__now--${now ? 'on' : 'off'}`}>{now ? 'now' : 'not now'}</Text>
      )}
      <Text className="tracker-check__type">{check.kind}</Text>
    </Box>
  );
};

export { TrackerCheckRow };
