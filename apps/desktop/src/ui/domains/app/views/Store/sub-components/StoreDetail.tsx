/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { CatalogInstallBar } from '@drizztdourden08/brock-catalog/renderer';
import { Box, Button, Flex, Image, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@app/utils';
import { storeMediaUrl } from '@app/lib/store/store-site';
import { KIND_ICONS, KIND_LABELS } from '../../../compounds/StoreItemCard';
import { Stars } from '../../../compounds/Stars';
import type { StoreDetailProps } from '../Store.type';
import { averageOf } from '../behavior/average-of';
import { liveVersionOf } from '../behavior/item-facts';

const StoreDetail = (props: StoreDetailProps) => {
  const { detail, pack, bar, onOpenSite } = props;
  const { item } = detail;
  const live = liveVersionOf(item);
  const icon = <Text as="span" className="store-detail__icon"><IconifyIcon icon={KIND_ICONS[item.kind]} /></Text>;

  return (
    <Stack gap="md" className="store-detail">
      <Image frame className="store-detail__image" src={storeMediaUrl(item.card) ?? undefined} alt="" fallback={icon} />
      <Text as="h3" className="store-detail__name">{item.name}</Text>
      <Text as="p" className="store__lead">{item.summary}</Text>
      <Box className="store-detail__facts">
        <Text as="span" className="store__label">kind</Text>
        <Text as="span">{KIND_LABELS[item.kind]}</Text>
        <Text as="span" className="store__label">author</Text>
        <Text as="span">{item.author.displayName}</Text>
        <Text as="span" className="store__label">version</Text>
        <Text as="span">{live ? `${live.semver} · ${formatBytes(live.bytes)}` : 'not published yet'}</Text>
        {pack && <Text as="span" className="store__label">installed</Text>}
        {pack && <Text as="span">{pack.semver}</Text>}
      </Box>
      <Stars average={averageOf(item.stats)} count={item.stats.ratingCount} />
      {(pack !== null || live !== null) && <CatalogInstallBar {...bar} />}
      <Flex wrap gap="sm">
        <Button variant="secondary" onClick={onOpenSite}>Open on the site</Button>
      </Flex>
    </Stack>
  );
};

export { StoreDetail };
