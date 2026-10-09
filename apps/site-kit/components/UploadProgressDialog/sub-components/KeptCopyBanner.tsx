/* @layer site-kit @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import alertIcon from '@iconify-icons/lucide/alert-triangle';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { DIALOG_TEXT } from '../UploadProgressDialog.constants';

const KeptCopyBanner = () => (
  <Flex align="start" gap="sm" className="upload-dialog__banner" role="note">
    <IconifyIcon icon={alertIcon} className="upload-dialog__banner-icon" />
    <Text as="p" variant="caption">{DIALOG_TEXT.keptCopy}</Text>
  </Flex>
);

export { KeptCopyBanner };
