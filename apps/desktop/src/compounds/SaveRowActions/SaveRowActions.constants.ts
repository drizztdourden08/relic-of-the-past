/* @layer renderer-components @kind constants */
import { createElement } from 'react';
import { Icon } from '@drizztdourden08/tessera/primitives';
import type { IconName } from '@drizztdourden08/tessera/primitives';
import type { ArmedAction } from '../ArmedActionButton';
import type { SaveRowIconPair } from '../SaveRowActionButton';

const iconPair = (idle: IconName, armed: IconName): SaveRowIconPair => ({
  idle: createElement(Icon, { name: idle }),
  armed: createElement(Icon, { name: armed }),
});

const SAVE_ROW_ICONS: Readonly<Record<ArmedAction, SaveRowIconPair>> = {
  load: iconPair('folder-open', 'folder-open'),
  save: iconPair('save', 'save'),
  delete: iconPair('trash-2', 'trash-2'),
};

export { SAVE_ROW_ICONS };
