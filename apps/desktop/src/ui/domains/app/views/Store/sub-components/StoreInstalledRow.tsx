/* @layer renderer-components @kind component */
import { CatalogInstallBar } from '@drizztdourden08/brock-catalog/renderer';
import { Card, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { KIND_LABELS } from '../../../compounds/StoreItemCard';
import type { StoreInstalledRowProps } from '../Store.type';
import { useInstallBar } from '../behavior/useInstallBar';

const StoreInstalledRow = (props: StoreInstalledRowProps) => {
  const { row, canUpdate, onSignedOut, onConfirmUninstall } = props;
  const { pack, item, hasUpdate } = row;
  const name = item?.name ?? pack.installedName;
  const version = hasUpdate && item?.semver ? `${pack.semver} -> ${item.semver}` : pack.semver;
  const bar = useInstallBar({ itemId: pack.itemId, name, hasUpdate: hasUpdate && canUpdate, onSignedOut, onConfirmUninstall });

  return (
    <Card className="store-installed-row">
      <Stack gap="sm">
        <Stack gap="xs">
          <Text as="span" className="store-installed-row__name">{name}</Text>
          <Text as="span" className="store__hint">{KIND_LABELS[pack.kind]} · {version}</Text>
        </Stack>
        <CatalogInstallBar {...bar} />
      </Stack>
    </Card>
  );
};

export { StoreInstalledRow };
