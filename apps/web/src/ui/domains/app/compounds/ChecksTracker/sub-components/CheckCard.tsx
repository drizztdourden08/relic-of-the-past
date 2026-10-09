/* @layer renderer-components @kind component */
import { Box, Image, Text } from '@ds/primitives';
import { getItem } from '@shared/game/data';
import { getItemSprite } from '@shared/game/logic/queries/item-sprites';
import { EVENT_MARK } from '../ChecksTracker.constants';
import type { CheckCardProps } from '../ChecksTracker.type';
import { CardSpritePlaceholder } from './CardSpritePlaceholder';
import { SwapBadge } from './SwapBadge';
import '../ChecksTracker.css';

const CheckCard = ({ check, status, item: itemId, foreignItem, now }: CheckCardProps) => {
  const showNow = now !== undefined && (now || status === 'completed');
  const isEvent = check.kind === 'event';
  const shownId = foreignItem === undefined ? itemId : undefined;
  const displayItem = foreignItem ?? (shownId ? getItem(shownId).name : undefined);
  const sprite = isEvent ? EVENT_MARK : (shownId ? getItemSprite(shownId) : undefined);

  return (
    <Box className={`tracker-card tracker-card--${status}${isEvent ? ' tracker-card--event' : ''}`}>
      {sprite
        ? <Image className="tracker-card__sprite" src={sprite} alt={displayItem ?? ''} draggable={false} fallback={<CardSpritePlaceholder />} />
        : <CardSpritePlaceholder />}
      <Box className="tracker-card__text">
        <Text className="tracker-card__item-name">{isEvent ? check.name : (displayItem ?? '???')}</Text>
        <Text className="tracker-card__check-name">{isEvent ? 'Event' : check.name}</Text>
      </Box>
      {showNow && (
        <Text className={`tracker-check__now tracker-card__now tracker-check__now--${now ? 'on' : 'off'}`}>{now ? 'now' : 'not now'}</Text>
      )}
      <SwapBadge check={check} shown={shownId} />
    </Box>
  );
};

export { CheckCard };
export type { CheckCardProps };
