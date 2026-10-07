/* @layer renderer-components @kind component */
/** One installed pack: its name, kind and version, Update when a newer one is live, and Uninstall. */
import { useCallback } from 'react';
import { Button, Card, Flex, Stack, Text } from '@ds/primitives';
import { KIND_LABELS } from '../../../compounds/StoreItemCard';
import type { InstallJob, InstalledRow } from '../Store.type';
import { StoreInstallBar } from './StoreInstallBar';

interface StoreInstalledRowProps {
  row: InstalledRow;
  job: InstallJob;
  /** Updating needs the store; uninstalling works signed out. */
  canUpdate: boolean;
  uninstalling: boolean;
  onUpdate: (itemId: string) => void;
  onCancel: (itemId: string) => void;
  onUninstall: (itemId: string, name: string) => void;
}

const StoreInstalledRow = (props: StoreInstalledRowProps) => {
  const { row, job, canUpdate, uninstalling, onUpdate, onCancel, onUninstall } = props;
  const { pack, item, hasUpdate } = row;
  const name = item?.name ?? pack.installedName;
  const version = hasUpdate && item?.semver ? `${pack.semver} → ${item.semver}` : pack.semver;

  const handleUpdate = useCallback(() => onUpdate(pack.itemId), [onUpdate, pack.itemId]);
  const handleCancel = useCallback(() => onCancel(pack.itemId), [onCancel, pack.itemId]);
  const handleUninstall = useCallback(() => onUninstall(pack.itemId, name), [onUninstall, pack.itemId, name]);

  return (
    <Card className="store-installed-row">
      <Stack gap="sm">
        <Flex align="center" justify="between" gap="md">
          <Stack gap="xs">
            <Text as="span" className="store-installed-row__name">{name}</Text>
            <Text as="span" className="store__hint">{KIND_LABELS[pack.kind]} · {version}</Text>
          </Stack>
          {!job.running && (
            <Flex gap="sm">
              {hasUpdate && canUpdate && <Button variant="primary" size="sm" onClick={handleUpdate}>Update</Button>}
              <Button variant="danger" size="sm" onClick={handleUninstall} disabled={uninstalling}>Uninstall</Button>
            </Flex>
          )}
        </Flex>
        {job.running && <StoreInstallBar job={job} onCancel={handleCancel} />}
        {job.error && <Text as="p" className="store__error">{job.error}</Text>}
      </Stack>
    </Card>
  );
};

export { StoreInstalledRow };
