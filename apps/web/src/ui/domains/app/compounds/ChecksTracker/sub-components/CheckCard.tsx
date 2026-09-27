/* @layer renderer-components @kind component */
/**
 * One check as a card: the sprite of what it holds (the app's own mark for an event), the
 * item or event name, and where it is. The tracker's card view and the check toasts share it.
 */
import { Box, Image, Text } from '@ds/primitives';
import { getItem } from '@shared/game/data';
import type { CheckRecord, ItemId } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic';
import { getItemSprite } from '@shared/game/logic/queries/item-sprites';
import { SwapBadge } from './SwapBadge';
import '../ChecksTracker.css';

interface CheckCardProps {
  check: CheckRecord;
  status: CheckStatus;
  /** The item this card shows, already resolved by the caller (check-contents.ts). */
  item?: ItemId;
  /** A reversible row's live side: true while what it did still holds. Undefined for every other row. */
  now?: boolean;
}

const SPRITE_PLACEHOLDER = <Box className="tracker-card__sprite-placeholder" />;

/** An event card carries the app's own mark where an item shows its sprite. */
const EVENT_MARK = './logos/logo-128.png';

const CheckCard = ({ check, status, item: itemId, now }: CheckCardProps) => {
  // The pill only says something once the row happened: 'not now' on a row never done is noise.
  const showNow = now !== undefined && (now || status === 'completed');
  const isEvent = check.kind === 'event';
  const displayItem = itemId ? getItem(itemId).name : undefined;
  const sprite = isEvent ? EVENT_MARK : (itemId ? getItemSprite(itemId) : undefined);

  return (
    <Box className={`tracker-card tracker-card--${status}${isEvent ? ' tracker-card--event' : ''}`}>
      {sprite
        ? <Image className="tracker-card__sprite" src={sprite} alt={displayItem ?? ''} draggable={false} fallback={SPRITE_PLACEHOLDER} />
        : SPRITE_PLACEHOLDER}
      <Box className="tracker-card__text">
        <Text className="tracker-card__item-name">{isEvent ? check.name : (displayItem ?? '???')}</Text>
        <Text className="tracker-card__check-name">{isEvent ? 'Event' : check.name}</Text>
      </Box>
      {showNow && (
        <Text className={`tracker-check__now tracker-card__now tracker-check__now--${now ? 'on' : 'off'}`}>{now ? 'now' : 'not now'}</Text>
      )}
      <SwapBadge check={check} shown={itemId} />
    </Box>
  );
};

export { CheckCard };
export type { CheckCardProps };
