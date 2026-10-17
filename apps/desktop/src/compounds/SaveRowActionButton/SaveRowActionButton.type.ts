/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface SaveRowIconPair {
  idle: ReactNode;
  armed: ReactNode;
}

interface SaveRowActionButtonProps {
  label: string;
  icons: SaveRowIconPair;
  armed: boolean;
  disabled?: boolean;
  disabledReason?: string;
  tabIndex?: number;
  onPress: () => void;
  onDisarm: () => void;
}

export type { SaveRowActionButtonProps, SaveRowIconPair };
