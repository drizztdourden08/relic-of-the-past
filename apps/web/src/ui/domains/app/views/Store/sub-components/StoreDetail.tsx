/* @layer renderer-components @kind component */
/**
 * The selected item beside the grid: its card, name, author, live version and size, its
 * stars, then Install, or Update and Uninstall when the app has it, with the bar while an
 * install runs. Everything else about the item opens on the site.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, Button, Flex, Stack, Text, Thumbnail } from '@ds/primitives';
import type { ItemResponse } from '@shared/store/api-types';
import type { InstalledPack } from '@shared/store/installed-types';
import { formatBytes } from '@app/utils';
import { storeMediaUrl } from '@app/lib/store/store-site';
import { KIND_ICONS, KIND_LABELS } from '../../../compounds/StoreItemCard';
import { Stars } from '../../../compounds/Stars';
import type { InstallJob } from '../Store.type';
import { averageOf, liveVersionOf } from '../behavior/item-facts';
import { StoreInstallBar } from './StoreInstallBar';

interface StoreDetailProps {
  detail: ItemResponse;
  pack: InstalledPack | null;
  job: InstallJob;
  uninstalling: boolean;
  onInstall: () => void;
  onCancel: () => void;
  onUninstall: () => void;
  onOpenSite: () => void;
}

const StoreDetail = (props: StoreDetailProps) => {
  const { detail, pack, job, uninstalling, onInstall, onCancel, onUninstall, onOpenSite } = props;
  const { item } = detail;
  const live = liveVersionOf(item);
  const hasUpdate = !!pack && !!live && live.semver !== pack.semver;
  const icon = <Text as="span" className="store-detail__icon"><IconifyIcon icon={KIND_ICONS[item.kind]} /></Text>;

  return (
    <Stack gap="md" className="store-detail">
      <Thumbnail className="store-detail__image" src={storeMediaUrl(item.card)} alt="" placeholder={icon} />
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
      {job.running && <StoreInstallBar job={job} onCancel={onCancel} />}
      {job.error && <Text as="p" className="store__error">{job.error}</Text>}
      <Flex wrap gap="sm">
        {!job.running && !pack && live && <Button variant="primary" onClick={onInstall}>Install</Button>}
        {!job.running && hasUpdate && <Button variant="primary" onClick={onInstall}>Update</Button>}
        {!job.running && pack && (
          <Button variant="danger" onClick={onUninstall} disabled={uninstalling}>Uninstall</Button>
        )}
        <Button variant="secondary" onClick={onOpenSite}>Open on the site</Button>
      </Flex>
    </Stack>
  );
};

export { StoreDetail };
export type { StoreDetailProps };
