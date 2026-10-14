/* @layer renderer-widgets @kind logic */
import { createElement } from 'react';
import { Icon } from '@drizztdourden08/tessera/primitives';
import type { IconName, TabItem } from '@drizztdourden08/tessera/primitives';

const toCollectionTab = (item: { id: string; icon: IconName; label: string }): TabItem => ({
  id: item.id,
  label: item.label,
  icon: createElement(Icon, { name: item.icon }),
});

export { toCollectionTab };
