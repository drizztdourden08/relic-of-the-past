/* @layer renderer-components @kind types */
import type { IconifyIcon as IconifyIconData } from '@iconify/types';

type LayoutEngine = 'flex' | 'grid';

interface EngineOption { value: LayoutEngine; icon: IconifyIconData; label: string }

interface EngineToggleProps {
  value: LayoutEngine;
  onChange: (next: string) => void;
}

export type { EngineOption, EngineToggleProps };
