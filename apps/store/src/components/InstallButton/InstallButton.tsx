/* @layer store-site @kind component */
/**
 * Install in the app, and Download beside it. Install opens the item's rotp:// link, so the
 * browser asks once to open Relic of the Past and the app installs it at once. Download is
 * for a player without the app: it saves the pack file itself.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import downloadIcon from '@iconify-icons/lucide/download';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { formatInstallLink } from '@shared/store/deep-link';
import type { Container } from '@shared/store/types';
import { useDownload } from './behavior/useDownload';

type InstallButtonProps = {
  itemId: string;
  /** The live version's file type, for the Download label; null while nothing is live. */
  container: Container | null;
  size?: 'sm' | 'md';
};

const openInApp = (itemId: string) => {
  window.location.href = formatInstallLink({ itemId, version: null });
};

const InstallButton = (props: InstallButtonProps) => {
  const { itemId, container, size = 'sm' } = props;
  const { busy, error, download } = useDownload(itemId);
  const live = container !== null;
  return (
    <>
      <Flex align="center" gap="sm" wrap>
        <Button variant="primary" size={size} disabled={!live} onClick={() => openInApp(itemId)}>
          Install in the app
        </Button>
        <Button
          variant="secondary"
          size={size}
          icon={<IconifyIcon icon={downloadIcon} />}
          disabled={!live || busy}
          title="For playing without the app installed"
          onClick={() => void download()}
        >
          {container ? `Download .${container}` : 'Download'}
        </Button>
      </Flex>
      {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
    </>
  );
};

export { InstallButton };
export type { InstallButtonProps };
