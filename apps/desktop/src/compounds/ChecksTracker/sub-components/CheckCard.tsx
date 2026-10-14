/* @layer renderer-components @kind component */
import { Box, Image, Text } from '@drizztdourden08/tessera/primitives';
import { cardSpriteOf } from '../behavior/card-sprite';
import { displayItemOf } from '../behavior/display-item';
import type { CheckCardProps } from '../ChecksTracker.type';
import { CardSpritePlaceholder } from './CardSpritePlaceholder';
import { NowPill } from './NowPill';
import { SwapBadge } from './SwapBadge';
import './CheckCard.css';

const CheckCard = ({ check, status, item, foreignItem, now }: CheckCardProps) => {
  const isEvent = check.kind === 'event';
  const { shownId, name } = displayItemOf(item, foreignItem);
  const sprite = cardSpriteOf(isEvent, shownId);

  return (
    <Box className={`tracker-card tracker-card--${status}${isEvent ? ' tracker-card--event' : ''}`}>
      {sprite
        ? <Image className="tracker-card__sprite" src={sprite} alt={name ?? ''} draggable={false} fallback={<CardSpritePlaceholder />} />
        : <CardSpritePlaceholder />}
      <Box className="tracker-card__text">
        <Text className="tracker-card__item-name">{isEvent ? check.name : (name ?? '???')}</Text>
        <Text className="tracker-card__check-name">{isEvent ? 'Event' : check.name}</Text>
      </Box>
      <NowPill className="tracker-card__now" now={now} status={status} />
      <SwapBadge check={check} shown={shownId} />
    </Box>
  );
};

export { CheckCard };
export type { CheckCardProps };
