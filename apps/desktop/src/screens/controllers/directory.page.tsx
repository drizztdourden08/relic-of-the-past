/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { ControllerDirectory } from '@app/views/ControllerDirectory';
import { PADS_ROUTE } from './controllers.constants';

const meta: ScreenMeta = {
  title: 'Directory',
  icon: 'list',
  order: 0,
  fill: true,
  keywords: ['controller', 'gamepad', 'directory', 'mapping', 'sdl', 'vid', 'pid', 'rescan'],
};

const DirectoryPage = (props: PageProps) => {
  const { open } = props;
  const openController = useCallback((deviceKey: string) => open(`${PADS_ROUTE}/${deviceKey}`), [open]);
  return <ControllerDirectory onOpenController={openController} />;
};

export default DirectoryPage;
export { meta };
