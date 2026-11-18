/* @layer renderer-components @kind types */
import type { Message } from '@drizztdourden08/brock-core/i18n';

interface StudioTabItem {
  id: string;
  label: Message;
}

type StudioTab = 'music' | 'ambient' | 'effects' | 'files';

export type { StudioTab, StudioTabItem };
