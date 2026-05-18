import { useState } from 'react';
import type { CheckDefinition } from '@shared/game/types';
import type { CheckStatus } from '@shared/game/logic/eval';
import { TrackerCheckRow } from './TrackerCheckRow';
import './TrackerView.css';

interface TrackerRegionSectionProps {
  region: string;
  checks: CheckDefinition[];
  statuses: Map<string, CheckStatus>;
}

export const TrackerRegionSection = (props: TrackerRegionSectionProps) => {
  const { region, checks, statuses } = props;
  const [expanded, setExpanded] = useState(false);

  const completed = checks.filter(c => statuses.get(c.id) === 'completed').length;
  const reachable = checks.filter(c => statuses.get(c.id) === 'reachable').length;

  return (
    <div className="tracker-region">
      <button className="tracker-region__header" onClick={() => setExpanded(!expanded)}>
        <span className="tracker-region__chevron">{expanded ? '▼' : '▶'}</span>
        <span className="tracker-region__name">{region}</span>
        <span className="tracker-region__counts">
          <span className="tracker-region__count tracker-region__count--completed">{completed}</span>
          /
          <span className="tracker-region__count tracker-region__count--reachable">{reachable}</span>
          /
          <span className="tracker-region__count">{checks.length}</span>
        </span>
      </button>
      {expanded && (
        <div className="tracker-region__checks">
          {checks.map(check => (
            <TrackerCheckRow key={check.id} check={check} status={statuses.get(check.id) ?? 'blocked'} />
          ))}
        </div>
      )}
    </div>
  );
}
