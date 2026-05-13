import { useState } from 'react';
import type { CheckDefinition } from '@shared/types/tracker';
import type { CheckStatus } from '@shared/lib/logic-eval';
import type { GroupNode } from '@shared/data/checks/grouping';
import type { ViewMode } from './TrackerFilters';
import { TrackerCheckRow } from './TrackerCheckRow';
import { getItemSprite } from '@shared/data/item-sprites';
import './TrackerView.css';

interface TrackerGroupTreeProps {
  node: GroupNode;
  statuses: Map<string, CheckStatus>;
  viewMode: ViewMode;
  depth?: number;
}

export function TrackerGroupTree({ node, statuses, viewMode, depth = 0 }: TrackerGroupTreeProps) {
  // Root node renders children directly
  if (depth === 0 && node.children.length > 0) {
    return (
      <div className="tracker-groups">
        {node.children.map(child => (
          <TrackerGroupSection key={child.key} node={child} statuses={statuses} viewMode={viewMode} depth={1} />
        ))}
      </div>
    );
  }

  // Flat mode — render checks directly
  if (node.children.length === 0 && node.checks.length > 0) {
    return (
      <div className="tracker-groups">
        <CheckList checks={node.checks} statuses={statuses} viewMode={viewMode} />
      </div>
    );
  }

  return null;
}

function TrackerGroupSection({ node, statuses, viewMode, depth }: TrackerGroupTreeProps & { depth: number }) {
  const [expanded, setExpanded] = useState(false);
  const { completed, reachable, total } = node.stats;

  return (
    <div className={`tracker-group tracker-group--depth-${Math.min(depth, 4)}`}>
      <button className="tracker-group__header" onClick={() => setExpanded(!expanded)}>
        <span className="tracker-group__chevron">{expanded ? '▼' : '▶'}</span>
        <span className="tracker-group__name">{node.label}</span>
        <span className="tracker-group__counts">
          <span className="tracker-group__count--completed">{completed}</span>
          /
          <span className="tracker-group__count--reachable">{reachable}</span>
          /
          <span className="tracker-group__count--total">{total}</span>
        </span>
      </button>
      {expanded && (
        <div className="tracker-group__content">
          {node.children.length > 0
            ? node.children.map(child => (
                <TrackerGroupSection key={child.key} node={child} statuses={statuses} viewMode={viewMode} depth={depth + 1} />
              ))
            : <CheckList checks={node.checks} statuses={statuses} viewMode={viewMode} />
          }
        </div>
      )}
    </div>
  );
}

function CheckList({ checks, statuses, viewMode }: { checks: CheckDefinition[]; statuses: Map<string, CheckStatus>; viewMode: ViewMode }) {
  if (viewMode === 'visual') {
    return (
      <div className="tracker-checks--visual">
        {checks.map(check => (
          <CheckCard key={check.id} check={check} status={statuses.get(check.id) ?? 'blocked'} />
        ))}
      </div>
    );
  }

  return (
    <div className="tracker-checks--list">
      {checks.map(check => (
        <TrackerCheckRow
          key={check.id}
          check={check}
          status={statuses.get(check.id) ?? 'blocked'}
          detailed={viewMode === 'detailed'}
        />
      ))}
    </div>
  );
}

function CheckCard({ check, status }: { check: CheckDefinition; status: CheckStatus }) {
  const sprite = check.vanillaItem ? getItemSprite(check.vanillaItem) : undefined;

  return (
    <div className={`tracker-card tracker-card--${status}`}>
      {sprite && (
        <img className="tracker-card__sprite" src={sprite} alt={check.vanillaItem} draggable={false} />
      )}
      {!sprite && <div className="tracker-card__sprite-placeholder" />}
      <div className="tracker-card__text">
        <span className="tracker-card__item-name">{check.vanillaItem ?? '???'}</span>
        <span className="tracker-card__check-name">{check.name}</span>
      </div>
    </div>
  );
}
