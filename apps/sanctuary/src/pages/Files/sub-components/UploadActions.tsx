/* @layer sanctuary-site @kind component */
/**
 * The Files header's end: the drop target, as tall as the header line (a drop or a click starts the usual
 * upload flow) and, while the uploads panel is closed with rows in it, a button that
 * brings the panel back.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import uploadIcon from '@iconify-icons/lucide/upload';
import { Button } from '@ds/primitives/Button';
import { DropZone } from '@ds/primitives/DropZone';
import { Flex } from '@ds/primitives/Flex';
import { LIMITS } from '@shared/sanctuary/limits';
import { formatBytes } from '../../../lib/format-bytes';

type UploadActionsProps = {
  canUpload: boolean;
  onDrop: (files: File[]) => void;
  /** Rows the closed panel holds; 0 hides the button. */
  hiddenUploads: number;
  onShowUploads: () => void;
};

const DROP_HINT = `Up to ${formatBytes(LIMITS.fileBytes)} each, stored exactly as sent.`;

const UploadActions = (props: UploadActionsProps) => {
  const { canUpload, onDrop, hiddenUploads, onShowUploads } = props;
  return (
    <Flex align="stretch" gap="sm" className="upload-actions">
      {hiddenUploads > 0 && (
        <Button variant="ghost" size="sm" className="upload-actions__show" onClick={onShowUploads}>
          Uploads ({hiddenUploads})
        </Button>
      )}
      {canUpload && (
        <DropZone
          variant="inline"
          label="Drop files here or browse"
          hint={DROP_HINT}
          icon={<IconifyIcon icon={uploadIcon} />}
          onDrop={onDrop}
        />
      )}
    </Flex>
  );
};

export { UploadActions };
export type { UploadActionsProps };
