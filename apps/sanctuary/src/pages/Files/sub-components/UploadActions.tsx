/* @layer sanctuary-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import uploadIcon from '@iconify-icons/lucide/upload';
import { DropZone, Flex } from '@drizztdourden08/tessera/primitives';
import { DROP_HINT } from './UploadActions.constants';
import type { UploadActionsProps } from './UploadActions.type';

const UploadActions = (props: UploadActionsProps) => {
  const { canUpload, onDrop } = props;
  if (!canUpload) return null;
  return (
    <Flex align="stretch" gap="sm" className="upload-actions">
      <DropZone
        variant="inline"
        label="Drop files here or browse"
        hint={DROP_HINT}
        icon={<IconifyIcon icon={uploadIcon} />}
        onDrop={onDrop}
      />
    </Flex>
  );
};

export { UploadActions };
