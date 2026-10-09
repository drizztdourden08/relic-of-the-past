/* @layer renderer-app @kind types */
import type { MenuEntry } from '@drizztdourden08/brock-react';

interface MobileMenuDrawerProps {
  entries: readonly MenuEntry[];
  fps: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPick: (entry: MenuEntry) => void;
}

export type { MobileMenuDrawerProps };
