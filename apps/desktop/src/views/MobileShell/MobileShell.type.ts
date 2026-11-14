/* @layer renderer-app @kind types */
import type { MenuEntry, MenuItem } from '@drizztdourden08/brock-react';

interface MobileMenuDrawerProps {
  entries: readonly MenuEntry[];
  fps: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPick: (entry: MenuEntry) => void;
}

interface MobileMenuRowProps {
  item: MenuItem;
  onPress: (item: MenuItem) => void;
}

interface MobileMenuGroup {
  key: string;
  title?: string;
  items: MenuItem[];
}

export type { MobileMenuDrawerProps, MobileMenuGroup, MobileMenuRowProps };
