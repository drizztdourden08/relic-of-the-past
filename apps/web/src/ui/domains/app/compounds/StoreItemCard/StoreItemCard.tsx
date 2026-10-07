/* @layer renderer-components @kind component */
/**
 * One Hookshop item in a grid or a shelf: its card picture, name, author and version, then its
 * stars, or whether it is installed or has an update. Bare: the host passes the item, what the
 * app has of it and the select handler.
 */
import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Badge, Card, Flex, Stack, Text, Thumbnail } from '@ds/primitives';
import { Stars } from '../Stars';
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
      <Thumbnail
        className="store-item-card__image"
        src={imageUrl}
        alt=""
        placeholder={<Text as="span" className="store-item-card__icon"><IconifyIcon icon={KIND_ICONS[item.kind]} /></Text>}
      />
      <Stack gap="xs" className="store-item-card__body">
        <Text as="span" className="store-item-card__kind">{KIND_LABELS[item.kind]}</Text>
        <Text as="span" className="store-item-card__name">{item.name}</Text>
        <Text as="span" className="store-item-card__byline">{byline}</Text>
        <Flex align="center" justify="between" gap="sm">
          <Stars average={item.ratingAverage} />
          {status === 'installed' && <Badge variant="success">installed</Badge>}
          {status === 'update' && <Badge variant="warning">update</Badge>}
        </Flex>
      </Stack>
    </Card>
  );
};

export { StoreItemCard };
