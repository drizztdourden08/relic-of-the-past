import { useState } from 'react';
import type { CheckDefinition } from '@shared/game/types';
import type { CheckStatus } from '@shared/game/logic/eval';
import { TrackerCheckRow } from './TrackerCheckRow';
import '../TrackerView.css';

interface TrackerAreaSectionProps {
  area: string;
  checks: CheckDefinition[];
  statuses: Map<string, CheckStatus>;
}

const TrackerAreaSection = (props: TrackerAreaSectionProps) => {
  const { area, checks, statuses } = props;
  const [expanded, setExpanded] = useState(false);

  const completed = checks.filter(c => statuses.get(c.id) === 'completed').length;
  const reachable = checks.filter(c => statuses.get(c.id) === 'reachable').length;

  return (
    <div className="tracker-area">
      <button className="tracker-area__header" onClick={() => setExpanded(!expanded)}>
        <span className="tracker-area__chevron">{expanded ? '▼' : '▶'}</span>
        <span className="tracker-area__name">{area}</span>
        <span className="tracker-area__counts">
          <span className="tracker-area__count tracker-area__count--completed">{completed}</span>
          /
          <span className="tracker-area__count tracker-area__count--reachable">{reachable}</span>
          /
          <span className="tracker-area__count">{checks.length}</span>
        </span>
      </button>
      {expanded && (
        <div className="tracker-area__checks">
          {checks.map(check => (
            <TrackerCheckRow key={check.id} check={check} status={statuses.get(check.id) ?? 'blocked'} />
          ))}
        </div>
      )}
    </div>
  );
}

export { TrackerAreaSection };
