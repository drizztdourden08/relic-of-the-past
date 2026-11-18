/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import lockIcon from '@iconify-icons/lucide/lock';
import { Status } from '@drizztdourden08/tessera/primitives';
import type { HookshopChipProps } from './HookshopChip.type';
import './HookshopChip.css';

const HookshopChip = (props: HookshopChipProps) => {
  const t = useT();
  const { label = t('compounds:hookshop-chip.label') } = props;

  return (
    <Status tone="neutral" className="hookshop-chip" title={t('compounds:hookshop-chip.installed-from-the-hookshop-read')}>
      <IconifyIcon icon={lockIcon} />
      {label}
    </Status>
  );
};

export { HookshopChip };
