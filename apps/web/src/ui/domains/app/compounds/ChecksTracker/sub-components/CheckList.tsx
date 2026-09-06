/* @layer renderer-components @kind component */
/**
 * The leaves of the check tree, in the three view modes.
 *
 * A check with several vanilla items expands to one entry per item in the
 * modes that show the item, but only WITHOUT a run: once a seed has placed
 * something there, the check holds exactly one thing, so it collapses back to
 * a single row showing that.
 */
import { Box, Image, Text } from '@ds/primitives';
import { getItem } from '@shared/game/data';
import type { CheckRecord, ItemId } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic/eval';
import type { RunContext } from '@shared/game/logic/queries/check-grouping';
import { getItemSprite } from '@shared/game/logic/queries/item-sprites';
import { TrackerCheckRow } from './TrackerCheckRow';
import type { ViewMode } from './TrackerFilters';
import '../ChecksTracker.css';

interface CheckListProps {
  checks: CheckRecord[];
  statuses: Map<string, CheckStatus>;
  viewMode: ViewMode;
  run?: RunContext;
}

interface CheckCardProps {
  check: CheckRecord;
  status: CheckStatus;
  itemOverride?: ItemId;
}

const SPRITE_PLACEHOLDER = <Box className="tracker-card__sprite-placeholder" />;

const CheckCard = ({ check, status, itemOverride }: CheckCardProps) => {
  const itemId = itemOverride ?? check.vanillaItemIds[0];
  const displayItem = itemId ? getItem(itemId).randomizerName : undefined;
  const sprite = itemId ? getItemSprite(itemId) : undefined;

  return (
    <Box className={`tracker-card tracker-card--${status}`}>
      {sprite
        ? <Image className="tracker-card__sprite" src={sprite} alt={displayItem} draggable={false} fallback={SPRITE_PLACEHOLDER} />
        : SPRITE_PLACEHOLDER}
      <Box className="tracker-card__text">
        <Text className="tracker-card__item-name">{displayItem ?? '???'}</Text>
        <Text className="tracker-card__check-name">{check.randomizerName}</Text>
      </Box>
    </Box>
  );
};

/** The items to render for one check: the placed one, or its vanilla contents. */
const itemsOf = (check: CheckRecord, expand: boolean, run?: RunContext): (ItemId | undefined)[] => {
  const placed = run?.placedItems?.get(check.id);
  if (placed !== undefined) return [placed];
  if (expand && check.vanillaItemIds.length > 1) return [...check.vanillaItemIds];
  return [check.vanillaItemIds[0]];
};

const CheckList = (props: CheckListProps) => {
  const { checks, statuses, viewMode, run } = props;
  const showsItem = viewMode !== 'compact';

  if (viewMode === 'visual') {
    return (
      <Box className="tracker-checks--visual">
        {checks.flatMap((check) => {
          const status = statuses.get(check.id) ?? 'blocked';
          return itemsOf(check, true, run).map((itemId, i) => (
            <CheckCard key={`${check.id}__${i}`} check={check} status={status} itemOverride={itemId} />
          ));
        })}
      </Box>
    );
  }

  return (
    <Box className="tracker-checks--list">
      {checks.flatMap((check) => {
        const status = statuses.get(check.id) ?? 'blocked';
        return itemsOf(check, showsItem, run).map((itemId, i) => (
          <TrackerCheckRow
            key={`${check.id}__${i}`}
            check={check}
            status={status}
            detailed={showsItem}
            itemOverride={itemId}
          />
        ));
      })}
    </Box>
  );
};

export { CheckList };
export type { CheckListProps };
