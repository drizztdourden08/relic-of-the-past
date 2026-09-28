/* @layer store-site @kind component */
/**
 * The item's first tab, under its hero: when it was published and last updated, the
 * description, then the details of the live version, or of the version the host passes
 * (the review page shows the one under review).
 */
import { SettingsSection } from '@ds/composites/SettingsSection';
import { Stack } from '@ds/primitives/Stack';
import { StatRow } from '@ds/primitives/StatRow';
import { Text } from '@ds/primitives/Text';
import type { StoreItem, StoreVersion } from '@shared/store/types';
import { TagList } from '@site-kit/components/TagList/TagList';
import { formatDay } from '@site-kit/lib/format-date';
import { KindChip } from '../../../components/KindChip/KindChip';
import { Markdown } from '../../../components/Markdown/Markdown';
import { factsLine } from '../../../catalog/facts-line';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { formatCount } from '../../../lib/format-count';

type ItemOverviewProps = {
  item: StoreItem;
  /** The version to show; the live one when absent. */
  version?: StoreVersion | null;
};

const SHA_EDGE = 4;

const shortHash = (sha: string | null) => (sha ? `${sha.slice(0, SHA_EDGE)}...${sha.slice(-SHA_EDGE)}` : '-');

const datesLine = (item: StoreItem) => {
  const published = item.publishedAt ? `published ${formatDay(item.publishedAt)}` : 'not published yet';
  return `${published} · updated ${formatDay(item.updatedAt)}`;
};

const ItemOverview = (props: ItemOverviewProps) => {
  const { item, version } = props;
  const live = version === undefined ? liveVersionOf(item) : version;
  return (
    <Stack gap="lg" align="stretch" className="item-overview">
      <Text as="p" variant="caption">{datesLine(item)}</Text>
      {item.description.trim() ? <Markdown source={item.description} /> : <Text as="p">{item.summary}</Text>}
      <SettingsSection title="Details">
        <StatRow label="kind" value={<KindChip kind={item.kind} />} />
        <StatRow label="version" value={live ? live.semver : 'none approved yet'} mono />
        {live && factsLine(live.facts) && <StatRow label="contents" value={factsLine(live.facts)} />}
        <StatRow label="installs" value={formatCount(item.stats.installs)} />
        <StatRow label="license" value={item.license || '-'} />
        <StatRow label="tags" value={<TagList tags={item.tags} />} />
        {live && <StatRow label="sha256" value={shortHash(live.sha256)} mono />}
      </SettingsSection>
    </Stack>
  );
};

export { ItemOverview };
export type { ItemOverviewProps };
