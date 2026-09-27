/* @layer store-site @kind component */
/**
 * The picked item in the side column: its card, kind, author, live version with its size
 * and manifest line, installs, license, tags and rating, then Install, Download and Open.
 * The card shows what the catalogue already holds while the full item loads.
 */
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import type { ItemCardView } from '@shared/store/home-types';
import { KIND_CONTAINER } from '@shared/store/containers';
import { DetailPane } from '@site-kit/components/DetailPane/DetailPane';
import type { DetailField } from '@site-kit/components/DetailPane/DetailPane';
import { TagList } from '@site-kit/components/TagList/TagList';
import { Chip } from '@site-kit/components/Chip/Chip';
import { Link } from '@site-kit/router/Link';
import { formatBytes } from '@site-kit/lib/format-bytes';
import type { ItemResponse } from '@shared/store/api-types';
import { InstallButton } from '../../../components/InstallButton/InstallButton';
import { ItemPicture } from '../../../components/ItemPicture/ItemPicture';
import { KindChip } from '../../../components/KindChip/KindChip';
import { Stars } from '../../../components/Stars/Stars';
import { authorPath, itemPath } from '../../../catalog/item-paths';
import { factsLine } from '../../../catalog/facts-line';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { formatAverage, formatCount, plural } from '../../../lib/format-count';

type ItemSideCardProps = {
  item: ItemCardView;
  /** The full item; null while it loads. */
  detail: ItemResponse | null;
  onClose: () => void;
};

const versionLine = (card: ItemCardView, detail: ItemResponse | null): string => {
  const live = detail ? liveVersionOf(detail.item) : null;
  if (!live) return card.semver ?? 'none approved yet';
  return [live.semver, formatBytes(live.bytes), factsLine(live.facts)].filter(Boolean).join(' · ');
};

const fieldsOf = (card: ItemCardView, detail: ItemResponse | null): DetailField[] => [
  { label: 'kind', value: <KindChip kind={card.kind} /> },
  { label: 'author', value: <Link to={authorPath(card.author.userId)}>{card.author.displayName}</Link> },
  { label: 'version', value: versionLine(card, detail) },
  { label: 'installs', value: detail ? formatCount(detail.item.stats.installs) : `${formatCount(card.installs30d)} this month` },
  { label: 'license', value: detail?.item.license || '-' },
  { label: 'tags', value: <TagList tags={detail?.item.tags ?? []} /> },
  {
    label: 'rating',
    value: (
      <Flex align="center" gap="xs" wrap>
        <Text as="span">{formatAverage(card.ratingAverage)}</Text>
        <Stars value={card.ratingAverage} />
        <Text as="span" variant="caption">{plural(card.ratingCount, 'rating', 'ratings')}</Text>
      </Flex>
    ),
  },
  ...(detail?.installed ? [{ label: 'you', value: <Chip tone="green">installed</Chip> }] : []),
];

const ItemSideCard = (props: ItemSideCardProps) => {
  const { item, detail, onClose } = props;
  const actions = (
    <>
      <InstallButton itemId={item.id} container={item.semver ? KIND_CONTAINER[item.kind] : null} />
      <Link to={itemPath(item)} className="btn btn--tertiary btn--sm">Open {'›'}</Link>
    </>
  );
  return (
    <DetailPane
      title={item.name}
      media={<ItemPicture picture={item.card} kind={item.kind} />}
      fields={fieldsOf(item, detail)}
      actions={actions}
      onClose={onClose}
      className="side-panel item-side-card"
    />
  );
};

export { ItemSideCard };
export type { ItemSideCardProps };
