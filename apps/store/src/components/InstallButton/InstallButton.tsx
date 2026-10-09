/* @layer store-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import downloadIcon from '@iconify-icons/lucide/download';
import { Button, Flex } from '@drizztdourden08/tessera/primitives';
import { useDownload } from './behavior/useDownload';
import { useOpenInApp } from './behavior/useOpenInApp';
import type { InstallButtonProps } from './InstallButton.type';

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
export type { InstallButtonProps } from './InstallButton.type';
