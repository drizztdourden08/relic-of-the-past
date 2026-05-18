import { useState } from 'react';
import type { CheckDefinition } from '@shared/game/types';
import type { CheckStatus } from '@shared/game/logic/eval';
import type { GroupNode } from '@shared/game/checks/grouping';
import type { ViewMode } from './TrackerFilters';
import { TrackerCheckRow } from './TrackerCheckRow';
import { getItemSprite } from '@shared/game/items/sprites';
import '../TrackerView.css';

interface TrackerGroupTreeProps {
  node: GroupNode;
  statuses: Map<string, CheckStatus>;
  viewMode: ViewMode;
  depth?: number;
}

export const TrackerGroupTree = (props: TrackerGroupTreeProps) => {
  const { node, statuses, viewMode, depth = 0 } = props;
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
        {checks.flatMap(check => {
          const status = statuses.get(check.id) ?? 'blocked';
          if (Array.isArray(check.vanillaItem)) {
            return check.vanillaItem.map((item, i) => (
              <CheckCard key={`${check.id}__${i}`} check={check} status={status} itemOverride={item} />
            ));
          }
          return [<CheckCard key={check.id} check={check} status={status} />];
        })}
      </div>
    );
  }

  return (
    <div className="tracker-checks--list">
      {checks.flatMap(check => {
        const status = statuses.get(check.id) ?? 'blocked';
        if (Array.isArray(check.vanillaItem) && viewMode === 'detailed') {
          return check.vanillaItem.map((item, i) => (
            <TrackerCheckRow
              key={`${check.id}__${i}`}
              check={check}
              status={status}
              detailed
              itemOverride={item}
            />
          ));
        }
        return [(
          <TrackerCheckRow
            key={check.id}
            check={check}
            status={status}
            detailed={viewMode === 'detailed'}
          />
        )];
      })}
    </div>
  );
}

function CheckCard({ check, status, itemOverride }: { check: CheckDefinition; status: CheckStatus; itemOverride?: string }) {
  const displayItem = itemOverride ?? (Array.isArray(check.vanillaItem) ? check.vanillaItem.join(', ') : check.vanillaItem);
  const sprite = displayItem ? getItemSprite(displayItem) : undefined;

  return (
    <div className={`tracker-card tracker-card--${status}`}>
      {sprite && (
        <img className="tracker-card__sprite" src={sprite} alt={displayItem} draggable={false} />
      )}
      {!sprite && <div className="tracker-card__sprite-placeholder" />}
      <div className="tracker-card__text">
        <span className="tracker-card__item-name">{displayItem ?? '???'}</span>
        <span className="tracker-card__check-name">{check.name}</span>
      </div>
    </div>
  );
}
