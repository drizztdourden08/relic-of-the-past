/* @layer renderer-components @kind component */
/**
 * The gold lock mark of an item installed from the Hookshop: "Hookshop" on a list row, "From
 * the Hookshop" at the top of an editor. Only the words change, so every editor marks an
 * installed item the same way.
 */
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
