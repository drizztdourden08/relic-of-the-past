/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Status, Card, Flex, Image, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { Rating } from '@drizztdourden08/tessera/composites';
import { KIND_ICONS, KIND_LABELS } from './StoreItemCard.constants';
import type { StoreItemCardProps } from './StoreItemCard.type';
import './StoreItemCard.css';

const StoreItemCard = (props: StoreItemCardProps) => {
  const { item, imageUrl, status, selected, onSelect } = props;
  const handleClick = useCallback(() => onSelect(item.id), [onSelect, item.id]);
  const handleKey = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onSelect(item.id);
  }, [onSelect, item.id]);
  const byline = item.semver ? `${item.author.displayName} · ${item.semver}` : item.author.displayName;

  return (
    <Card
      variant="interactive"
      className={`store-item-card${selected ? ' store-item-card--selected' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={handleClick}
      onKeyDown={handleKey}
    >
      <Image
        frame
        className="store-item-card__image"
        src={imageUrl ?? undefined}
        alt=""
        fallback={<Text as="span" className="store-item-card__icon"><IconifyIcon icon={KIND_ICONS[item.kind]} /></Text>}
      />
      <Stack gap="xs" className="store-item-card__body">
        <Text as="span" className="store-item-card__kind">{KIND_LABELS[item.kind]}</Text>
        <Text as="span" className="store-item-card__name">{item.name}</Text>
        <Text as="span" className="store-item-card__byline">{byline}</Text>
        <Flex align="center" justify="between" gap="sm">
          <Rating value={item.ratingAverage} showValue size="sm" />
          {status === 'installed' && <Status tone="success">installed</Status>}
          {status === 'update' && <Status tone="warning">update</Status>}
        </Flex>
      </Stack>
    </Card>
  );
};

export { StoreItemCard };
