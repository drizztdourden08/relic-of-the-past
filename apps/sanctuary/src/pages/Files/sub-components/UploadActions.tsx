/* @layer sanctuary-site @kind component */
/**
 * The Files header's end: the drop target, as tall as the header line. A drop or a click
 * starts the usual upload flow; the uploads themselves show in the site's tray.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import uploadIcon from '@iconify-icons/lucide/upload';
import { DropZone } from '@ds/primitives/DropZone';
import { Flex } from '@ds/primitives/Flex';
import { LIMITS } from '@shared/sanctuary/limits';
import { formatBytes } from '@site-kit/lib/format-bytes';

type UploadActionsProps = {
  canUpload: boolean;
  onDrop: (files: File[]) => void;
};

const DROP_HINT = `Up to ${formatBytes(LIMITS.fileBytes)} each, stored exactly as sent.`;

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
export type { UploadActionsProps };
