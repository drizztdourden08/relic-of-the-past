/* @layer store-site @kind component */
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { VersionHistory } from '../../../components/VersionHistory/VersionHistory';
import { useVersionDelete } from '../behavior/useVersionDelete';
import type { ItemVersionsProps } from './ItemVersions.type';

const ItemVersions = (props: ItemVersionsProps) => {
  const { item, versions, canModerate, onItem } = props;
  const deletion = useVersionDelete(item.id, onItem);
  const message = deletion.asking
    ? `Delete ${deletion.asking.semver} of "${item.name}"? Its file is removed from the store and players can no longer install it. The author sees that you deleted it.`
    : '';

  return (
    <Stack gap="sm" align="stretch">
      {deletion.error && <Text as="p" variant="caption" role="alert">{deletion.error}</Text>}
      <VersionHistory
        versions={versions}
        liveVersion={item.liveVersion}
        onDelete={canModerate ? deletion.ask : undefined}
        busy={deletion.busy}
      />
      <Text as="p" variant="caption">Every version here was approved by a reviewer before players could install it. Older versions may have their file removed to save space.</Text>
      <Dialog
        open={deletion.asking !== null}
        title="Delete version"
        message={message}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => void deletion.confirm()}
        onCancel={deletion.cancel}
      />
    </Stack>
  );
};

export { ItemVersions };
