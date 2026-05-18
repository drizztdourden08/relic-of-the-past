import type { CheckDefinition } from '@shared/game/types';
import type { CheckStatus } from '@shared/game/logic/eval';
import './TrackerView.css';

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

export const TrackerCheckRow = (props: TrackerCheckRowProps) => {
  const { check, status, detailed, itemOverride } = props;
  const displayItem = itemOverride ?? (Array.isArray(check.vanillaItem) ? check.vanillaItem.join(', ') : check.vanillaItem);
  return (
    <div className={`tracker-check tracker-check--${status}`}>
      <span className="tracker-check__icon">{STATUS_ICONS[status]}</span>
      <span className="tracker-check__name">{check.name}</span>
      {detailed && (
        <span className="tracker-check__item">{displayItem ?? '—'}</span>
      )}
      <span className="tracker-check__type">{check.type}</span>
    </div>
  );
}
