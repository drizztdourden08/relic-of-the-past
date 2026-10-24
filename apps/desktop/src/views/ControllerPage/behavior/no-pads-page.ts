/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { LivePage } from '@drizztdourden08/brock-react';
import { EmptyState, Icon } from '@drizztdourden08/tessera/primitives';
import { NO_PADS_KEY, NO_PADS_MESSAGE, NO_PADS_TITLE } from '../ControllerPage.constants';

const noPadsPage = (): LivePage => ({
  key: NO_PADS_KEY,
  title: NO_PADS_TITLE,
  render: () => createElement(EmptyState, { message: NO_PADS_MESSAGE, size: 'hero', icon: createElement(Icon, { name: 'gamepad-2' }) }),
});

export { noPadsPage };
