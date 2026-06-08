/* @layer renderer-components @kind component */
import { Box, Text } from '../../../../../design-system/primitives';
import type { CheckDefinition } from '@shared/game/types';
import type { CheckStatus } from '@shared/game/logic/eval';
import '../TrackerView.css';

interface TrackerCheckRowProps {
  check: CheckDefinition;
  status: CheckStatus;
  detailed?: boolean;
  /** Override the displayed item (used when expanding multi-item checks) */
  itemOverride?: string;
}

const STATUS_ICONS: Record<CheckStatus, string> = {
  completed: '✓',
  reachable: '●',
  blocked: '○',
};

const TrackerCheckRow = (props: TrackerCheckRowProps) => {
  const { check, status, detailed, itemOverride } = props;
  const displayItem = itemOverride ?? (Array.isArray(check.vanillaItem) ? check.vanillaItem.join(', ') : check.vanillaItem);
  return (
    <Box className={`tracker-check tracker-check--${status}`}>
      <Text className="tracker-check__icon">{STATUS_ICONS[status]}</Text>
      <Text className="tracker-check__name">{check.name}</Text>
      {detailed && (
        <Text className="tracker-check__item">{displayItem ?? '—'}</Text>
      )}
      <Text className="tracker-check__type">{check.type}</Text>
    </Box>
  );
}

export { TrackerCheckRow };
