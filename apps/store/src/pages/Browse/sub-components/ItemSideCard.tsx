/* @layer store-site @kind component */
import { Flex, Status, Text } from '@drizztdourden08/tessera/primitives';
import { Rating } from '@drizztdourden08/tessera/composites';
import type { ItemCardView, ItemResponse } from '@rotp/hub-contracts';
import { KIND_CONTAINER } from '@rotp/hub-contracts';
import { DetailPane, TagList, AppLink } from '@rotp/design';
import type { DetailField } from '@rotp/design';
import { formatBytes } from '@rotp/hub-client';
import { InstallButton } from '../../../components/InstallButton/InstallButton';
import { ItemPicture } from '../../../components/ItemPicture/ItemPicture';
import { KindChip } from '../../../components/KindChip/KindChip';
import { authorPath, itemPath } from '../../../catalog/item-paths';
import { factsLine } from '../../../catalog/facts-line';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { formatCount, plural } from '../../../format-count';
import type { ItemSideCardProps } from './ItemSideCard.type';

const versionLine = (card: ItemCardView, detail: ItemResponse | null): string => {
  const live = detail ? liveVersionOf(detail.item) : null;
  if (!live) return card.semver ?? 'none approved yet';
  return [live.semver, formatBytes(live.bytes), factsLine(live.facts)].filter(Boolean).join(' · ');
};

const fieldsOf = (card: ItemCardView, detail: ItemResponse | null): DetailField[] => [
  { label: 'kind', value: <KindChip kind={card.kind} /> },
  { label: 'author', value: <AppLink to={authorPath(card.author.userId)}>{card.author.displayName}</AppLink> },
  { label: 'version', value: versionLine(card, detail) },
  { label: 'installs', value: detail ? formatCount(detail.item.stats.installs) : `${formatCount(card.installs30d)} this month` },
  { label: 'license', value: [detail?.item.license].find(Boolean) ?? '-' },
  { label: 'tags', value: <TagList tags={detail?.item.tags ?? []} /> },
  {
    label: 'rating',
    value: (
      <Flex align="center" gap="xs" wrap>
        <Rating value={card.ratingAverage} showValue size="sm" />
        <Text as="span" variant="caption">{plural(card.ratingCount, 'rating', 'ratings')}</Text>
      </Flex>
    ),
  },
  ...(detail?.installed ? [{ label: 'you', value: <Status variant="pill" tone="success">installed</Status> }] : []),
];

const ItemSideCard = (props: ItemSideCardProps) => {
  const { item, detail, onClose } = props;
  const actions = (
    <>
      <InstallButton itemId={item.id} container={item.semver ? KIND_CONTAINER[item.kind] : null} />
      <AppLink to={itemPath(item)} className="btn btn--tertiary btn--toned btn--sm">Open {'›'}</AppLink>
    </>
  );
  return (
    <DetailPane
      title={item.name}
      media={<ItemPicture picture={item.card} kind={item.kind} color={item.color} />}
      fields={fieldsOf(item, detail)}
      actions={actions}
      onClose={onClose}
      className="item-side-card"
    />
  );
};

export { ItemSideCard };
