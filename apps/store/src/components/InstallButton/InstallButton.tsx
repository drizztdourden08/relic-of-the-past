/* @layer store-site @kind component */
/**
 * Install in the app, and Download beside it. Install opens the item's install link, so the
 * browser asks once to open Relic of the Past and the app installs it at once; when nothing
 * answers the link, a toast says so and points at Download. Download is for a player without
 * the app: it saves the pack file itself.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import downloadIcon from '@iconify-icons/lucide/download';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import type { Container } from '@shared/store/types';
import { useDownload } from './behavior/useDownload';
import { useOpenInApp } from './behavior/useOpenInApp';

type InstallButtonProps = {
  itemId: string;
  /** The live version's file type, for the Download label; null while nothing is live. */
  container: Container | null;
  size?: 'sm' | 'md';
};

const InstallButton = (props: InstallButtonProps) => {
  const { itemId, container, size = 'sm' } = props;
  const { busy, download } = useDownload(itemId);
  const openInApp = useOpenInApp(itemId);
  const live = container !== null;
  return (
    <Flex align="center" gap="sm" wrap>
      <Button variant="primary" size={size} disabled={!live} onClick={openInApp}>
        Install in the app
      </Button>
      <Button
        variant="secondary"
        size={size}
        icon={<IconifyIcon icon={downloadIcon} />}
        disabled={!live}
        busy={busy}
        title="For playing without the app installed"
        onClick={() => void download()}
      >
        {container ? `Download .${container}` : 'Download'}
      </Button>
    </Flex>
  );
};

export { InstallButton };
export type { InstallButtonProps };
