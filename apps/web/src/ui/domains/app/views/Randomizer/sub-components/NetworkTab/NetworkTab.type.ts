/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ProfileRandomizerConfig, RandomizerConnectionPatch } from '@shared/types/profile';
import type { SettingsPageAnchor } from '../../../../compounds/SettingsPage';

interface NetworkTabProps {
  /** The profile's randomizer config: its connection is named and edited here. */
  config: ProfileRandomizerConfig | null;
  /** Writes the profile's connection and reconnects the session on it. */
  onSaveConnection: (patch: RandomizerConnectionPatch) => Promise<void>;
  /** Draws the page around the tab, with the section links the tab says it has. */
  frame: (children: ReactNode, anchors?: SettingsPageAnchor[]) => ReactNode;
}

export type { NetworkTabProps };
