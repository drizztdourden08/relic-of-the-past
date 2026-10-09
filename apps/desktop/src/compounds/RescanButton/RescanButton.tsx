/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import refreshIcon from '@iconify-icons/lucide/refresh-cw';
import { IconButton } from '@drizztdourden08/tessera/primitives';
import { RESCAN_LABEL } from './RescanButton.constants';
import type { RescanButtonProps } from './RescanButton.type';
import './RescanButton.css';

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
