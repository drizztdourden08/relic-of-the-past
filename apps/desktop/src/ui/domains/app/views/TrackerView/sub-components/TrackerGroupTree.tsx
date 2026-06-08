/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Text, Image } from '../../../../../design-system/primitives';
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

const TrackerGroupTree = (props: TrackerGroupTreeProps) => {
  const { node, statuses, viewMode, depth = 0 } = props;
  // Root node renders children directly
  if (depth === 0 && node.children.length > 0) {
    return (
      <Box className="tracker-groups">
        {node.children.map(child => (
          <TrackerGroupSection key={child.key} node={child} statuses={statuses} viewMode={viewMode} depth={1} />
        ))}
      </Box>
    );
  }

  // Flat mode — render checks directly
  if (node.children.length === 0 && node.checks.length > 0) {
    return (
      <Box className="tracker-groups">
        <CheckList checks={node.checks} statuses={statuses} viewMode={viewMode} />
      </Box>
    );
  }

  return null;
}

const TrackerGroupSection = ({ node, statuses, viewMode, depth }: TrackerGroupTreeProps & { depth: number }) => {
  const [expanded, setExpanded] = useState(false);
  const { completed, reachable, total } = node.stats;

  return (
    <Box className={`tracker-group tracker-group--depth-${Math.min(depth, 4)}`}>
      <Box as="button" className="tracker-group__header" onClick={() => setExpanded(!expanded)}>
        <Text className="tracker-group__chevron">{expanded ? '▼' : '▶'}</Text>
        <Text className="tracker-group__name">{node.label}</Text>
        <Text className="tracker-group__counts">
          <Text className="tracker-group__count--completed">{completed}</Text>
          /
          <Text className="tracker-group__count--reachable">{reachable}</Text>
          /
          <Text className="tracker-group__count--total">{total}</Text>
        </Text>
      </Box>
      {expanded && (
        <Box className="tracker-group__content">
          {node.children.length > 0
            ? node.children.map(child => (
                <TrackerGroupSection key={child.key} node={child} statuses={statuses} viewMode={viewMode} depth={depth + 1} />
              ))
            : <CheckList checks={node.checks} statuses={statuses} viewMode={viewMode} />
          }
        </Box>
      )}
    </Box>
  );
};

const CheckList = ({ checks, statuses, viewMode }: { checks: CheckDefinition[]; statuses: Map<string, CheckStatus>; viewMode: ViewMode }) => {
  if (viewMode === 'visual') {
    return (
      <Box className="tracker-checks--visual">
        {checks.flatMap(check => {
          const status = statuses.get(check.id) ?? 'blocked';
          if (Array.isArray(check.vanillaItem)) {
            return check.vanillaItem.map((item, i) => (
              <CheckCard key={`${check.id}__${i}`} check={check} status={status} itemOverride={item} />
            ));
          }
          return [<CheckCard key={check.id} check={check} status={status} />];
        })}
      </Box>
    );
  }

  return (
    <Box className="tracker-checks--list">
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
    </Box>
  );
};

const CheckCard = ({ check, status, itemOverride }: { check: CheckDefinition; status: CheckStatus; itemOverride?: string }) => {
  const displayItem = itemOverride ?? (Array.isArray(check.vanillaItem) ? check.vanillaItem.join(', ') : check.vanillaItem);
  const sprite = displayItem ? getItemSprite(displayItem) : undefined;

  return (
    <Box className={`tracker-card tracker-card--${status}`}>
      {sprite && (
        <Image className="tracker-card__sprite" src={sprite} alt={displayItem} draggable={false} />
      )}
      {!sprite && <Box className="tracker-card__sprite-placeholder" />}
      <Box className="tracker-card__text">
        <Text className="tracker-card__item-name">{displayItem ?? '???'}</Text>
        <Text className="tracker-card__check-name">{check.name}</Text>
      </Box>
    </Box>
  );
};

export { TrackerGroupTree };
