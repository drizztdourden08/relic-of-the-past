/* @layer renderer-components @kind component */
import { Box, Text } from '../../../../../design-system/primitives';
import type { CheckRecord, ItemId } from '@shared/game/data';
import { getItem } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic/eval';
import '../TrackerView.css';

interface TrackerCheckRowProps {
  check: CheckRecord;
  status: CheckStatus;
  detailed?: boolean;
  /** Override the displayed item (used when expanding multi-item checks) */
  itemOverride?: ItemId;
}

const STATUS_ICONS: Record<CheckStatus, string> = {
  completed: '✓',
  reachable: '●',
  blocked: '○',
};

const TrackerCheckRow = (props: TrackerCheckRowProps) => {
  const { check, status, detailed, itemOverride } = props;
  const itemId = itemOverride ?? check.vanillaItemIds[0];
  const displayItem = itemId ? getItem(itemId).randomizerName : undefined;
  return (
    <Box className={`tracker-check tracker-check--${status}`}>
      <Text className="tracker-check__icon">{STATUS_ICONS[status]}</Text>
      <Text className="tracker-check__name">{check.randomizerName}</Text>
      {detailed && (
        <Text className="tracker-check__item">{displayItem ?? '-'}</Text>
      )}
      <Text className="tracker-check__type">{check.kind}</Text>
    </Box>
  );
}

export { TrackerCheckRow };
