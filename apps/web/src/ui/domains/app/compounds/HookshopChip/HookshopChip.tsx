/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import lockIcon from '@iconify-icons/lucide/lock';
import { Status } from '@drizztdourden08/tessera/primitives';
import type { HookshopChipProps } from './HookshopChip.type';
import './HookshopChip.css';

const HookshopChip = (props: HookshopChipProps) => {
  const { label = 'Hookshop' } = props;

  return (
    <Status tone="neutral" className="hookshop-chip" title="Installed from the Hookshop, read only">
      <IconifyIcon icon={lockIcon} />
      {label}
    </Status>
  );
};

export { HookshopChip };
