/* @layer renderer-components @kind logic */
import type { ReactNode } from 'react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ToolGroup } from '@drizztdourden08/tessera/primitives';

const sectionGroup = (t: I18n['t'], tabs: ReactNode): ToolGroup => ({
  id: 'section',
  label: t('msu-studio:studio.toolbar.section'),
  content: tabs,
});

export { sectionGroup };
