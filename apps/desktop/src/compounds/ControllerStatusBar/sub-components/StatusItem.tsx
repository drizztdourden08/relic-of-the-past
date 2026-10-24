/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Status } from '@drizztdourden08/tessera/primitives';
import type { StatusItemProps } from '../ControllerStatusBar.type';

const StatusItem = ({ icon, label, tone, dim }: StatusItemProps) => (
  <Status variant="pill" tone={tone} title={label} className="controller-status-bar__item" data-dim={dim ? '' : undefined}>
    <IconifyIcon icon={icon} width={12} height={12} />
    {label}
  </Status>
);

export { StatusItem };
