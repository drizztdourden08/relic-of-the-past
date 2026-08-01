/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Text, Image, Button } from '../../../../../design-system/primitives';
import type { CheckRecord, ItemId } from '@shared/game/data';
import { getItem } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic/eval';
import type { GroupNode } from '@shared/game/logic/queries/check-grouping';
import type { ViewMode } from './TrackerFilters';
import { TrackerCheckRow } from './TrackerCheckRow';
import { getItemSprite } from '@shared/game/logic/queries/item-sprites';
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
      <Button variant="bare" className="tracker-group__header" onClick={() => setExpanded(!expanded)}>
        <Text className="tracker-group__chevron">{expanded ? '▼' : '▶'}</Text>
        <Text className="tracker-group__name">{node.label}</Text>
        <Text className="tracker-group__counts">
          <Text className="tracker-group__count--completed">{completed}</Text>
          /
          <Text className="tracker-group__count--reachable">{reachable}</Text>
          /
          <Text className="tracker-group__count--total">{total}</Text>
        </Text>
      </Button>
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

const CheckList = ({ checks, statuses, viewMode }: { checks: CheckRecord[]; statuses: Map<string, CheckStatus>; viewMode: ViewMode }) => {
  if (viewMode === 'visual') {
    return (
      <Box className="tracker-checks--visual">
        {checks.flatMap(check => {
          const status = statuses.get(check.id) ?? 'blocked';
          if (check.vanillaItemIds.length > 1) {
            return check.vanillaItemIds.map((itemId, i) => (
              <CheckCard key={`${check.id}__${i}`} check={check} status={status} itemOverride={itemId} />
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
        if (check.vanillaItemIds.length > 1 && viewMode === 'detailed') {
          return check.vanillaItemIds.map((itemId, i) => (
            <TrackerCheckRow
              key={`${check.id}__${i}`}
              check={check}
              status={status}
              detailed
              itemOverride={itemId}
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

const CheckCard = ({ check, status, itemOverride }: { check: CheckRecord; status: CheckStatus; itemOverride?: ItemId }) => {
  const itemId = itemOverride ?? check.vanillaItemIds[0];
  const displayItem = itemId ? getItem(itemId).randomizerName : undefined;
  const sprite = itemId ? getItemSprite(itemId) : undefined;

  return (
    <Box className={`tracker-card tracker-card--${status}`}>
      {sprite && (
        <Image className="tracker-card__sprite" src={sprite} alt={displayItem} draggable={false} />
      )}
      {!sprite && <Box className="tracker-card__sprite-placeholder" />}
      <Box className="tracker-card__text">
        <Text className="tracker-card__item-name">{displayItem ?? '???'}</Text>
        <Text className="tracker-card__check-name">{check.randomizerName}</Text>
      </Box>
    </Box>
  );
};

export { TrackerGroupTree };
