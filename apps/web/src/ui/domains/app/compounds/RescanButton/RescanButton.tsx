/* @layer renderer-components @kind component */
/**
 * RescanButton — the one screen-level control that tears down and
 * repopulates the controller list. Icon-only and small by design: it lives
 * in a screen header, never on an individual device card, because the
 * rescan it triggers is subsystem-wide rather than per-device.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import refreshIcon from '@iconify-icons/lucide/refresh-cw';
import { IconButton } from '../../../../design-system/primitives/IconButton';
import type { RescanButtonProps } from './RescanButton.type';
import './RescanButton.css';

const RESCAN_LABEL = 'Rescan controllers';

const RescanButton = (props: RescanButtonProps) => {
  const { isPending, onRescan } = props;
  const iconClass = isPending ? 'rescan-btn__icon rescan-btn__icon--spinning' : 'rescan-btn__icon';

  return (
    <IconButton variant="ghost" size="sm" label={RESCAN_LABEL} title={RESCAN_LABEL} onClick={onRescan} disabled={isPending}>
      <IconifyIcon icon={refreshIcon} width={14} height={14} className={iconClass} />
    </IconButton>
  );
};

export { RescanButton };
