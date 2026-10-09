/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import lockIcon from '@iconify-icons/lucide/lock';
import { Badge } from '@ds/primitives';
import type { HookshopChipProps } from './HookshopChip.type';
import './HookshopChip.css';

const HookshopChip = (props: HookshopChipProps) => {
  const { label = 'Hookshop' } = props;

  return (
    <Badge variant="neutral" className="hookshop-chip" title="Installed from the Hookshop, read only">
      <IconifyIcon icon={lockIcon} />
      {label}
    </Badge>
  );
};

export { HookshopChip };
