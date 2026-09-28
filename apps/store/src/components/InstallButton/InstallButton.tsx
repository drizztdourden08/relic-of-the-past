/* @layer store-site @kind component */
/**
 * Install in the app, and Download beside it. Install opens the item's rotp:// link, so the
 * browser asks once to open Relic of the Past and the app installs it at once; when nothing
 * answers the link, a line says so and points at Download. Download is for a player without
 * the app: it saves the pack file itself.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import downloadIcon from '@iconify-icons/lucide/download';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import type { Container } from '@shared/store/types';
import { useDownload } from './behavior/useDownload';
import { useOpenInApp } from './behavior/useOpenInApp';

type InstallButtonProps = {
  itemId: string;
  /** The live version's file type, for the Download label; null while nothing is live. */
  container: Container | null;
  size?: 'sm' | 'md';
};

const NOT_ANSWERED = 'Nothing opened: installing from the store needs the latest Relic of the Past on this computer. Use Download for now.';

const InstallButton = (props: InstallButtonProps) => {
  const { itemId, container, size = 'sm' } = props;
  const { busy, error, download } = useDownload(itemId);
  const app = useOpenInApp(itemId);
  const live = container !== null;
  return (
    <>
      <Flex align="center" gap="sm" wrap>
        <Button variant="primary" size={size} disabled={!live} onClick={app.open}>
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
      {app.missed && <Text as="p" variant="caption" role="status">{NOT_ANSWERED}</Text>}
      {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
    </>
  );
};

export { InstallButton };
export type { InstallButtonProps };
