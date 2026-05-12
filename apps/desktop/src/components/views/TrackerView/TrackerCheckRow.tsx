import type { CheckDefinition } from '@shared/types/tracker';
import type { CheckStatus } from '@shared/lib/logic-eval';
import './TrackerView.css';

interface TrackerCheckRowProps {
  check: CheckDefinition;
  status: CheckStatus;
}

const STATUS_ICONS: Record<CheckStatus, string> = {
  completed: '✓',
  reachable: '●',
  blocked: '○',
};

export function TrackerCheckRow({ check, status }: TrackerCheckRowProps): JSX.Element {
  return (
    <div className={`tracker-check tracker-check--${status}`}>
      <span className="tracker-check__icon">{STATUS_ICONS[status]}</span>
      <span className="tracker-check__name">{check.name}</span>
      <span className="tracker-check__type">{check.type}</span>
    </div>
  );
}
