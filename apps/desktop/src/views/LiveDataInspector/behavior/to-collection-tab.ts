/* @layer renderer-widgets @kind logic */
import { createElement } from 'react';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import { Icon } from '@drizztdourden08/tessera/primitives';
import type { IconName, TabItem } from '@drizztdourden08/tessera/primitives';

const toCollectionTab = (text: (value: Message) => string) => (item: { id: string; icon: IconName; label: Message }): TabItem => ({
  id: item.id,
  label: text(item.label),
  icon: createElement(Icon, { name: item.icon }),
});

export { toCollectionTab };
