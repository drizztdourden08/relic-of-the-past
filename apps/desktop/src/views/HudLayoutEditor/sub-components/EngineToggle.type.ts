/* @layer renderer-components @kind types */
import type { IconifyIcon as IconifyIconData } from '@iconify/types';
import type { Message } from '@drizztdourden08/brock-core/i18n';

type LayoutEngine = 'flex' | 'grid';

interface EngineOption { value: LayoutEngine; icon: IconifyIconData; label: Message }

interface EngineToggleProps {
  value: LayoutEngine;
  onChange: (next: string) => void;
}

export type { EngineOption, EngineToggleProps };
