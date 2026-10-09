/* @layer site-kit @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import chevronDownIcon from '@iconify-icons/lucide/chevron-down';
import chevronUpIcon from '@iconify-icons/lucide/chevron-up';
import xIcon from '@iconify-icons/lucide/x';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import type { TrayHeaderProps } from './TrayHeader.type';

const TrayHeader = (props: TrayHeaderProps) => {
  const { tray } = props;
  const { count, running, collapsed, toggle, close } = tray;
  return (
    <Flex align="center" gap="sm" className="upload-tray__head">
      <Text as="span" variant="label" className="upload-tray__title">Uploads</Text>
      <Text as="span" className="upload-tray__count">{running > 0 ? `${count} · ${running} running` : count}</Text>
      <IconButton variant="ghost" size="sm" label={collapsed ? 'Show the uploads' : 'Fold the uploads'} onClick={toggle}>
        <IconifyIcon icon={collapsed ? chevronUpIcon : chevronDownIcon} />
      </IconButton>
      <IconButton variant="ghost" size="sm" label="Close" onClick={close}>
        <IconifyIcon icon={xIcon} />
      </IconButton>
    </Flex>
  );
};

export { TrayHeader };
