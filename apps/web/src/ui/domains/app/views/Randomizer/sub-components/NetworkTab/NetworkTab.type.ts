/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';
import type { SettingsPageAnchor } from '../../../../compounds/SettingsPage';

interface NetworkTabProps {
  config: ProfileRandomizerConfig | null;
  onSaveConnection: (patch: RandomizerConnectionPatch) => Promise<void>;
  frame: (children: ReactNode, anchors?: SettingsPageAnchor[]) => ReactNode;
}

export type { NetworkTabProps };
