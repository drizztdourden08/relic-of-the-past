/* @layer renderer-components @kind types */
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import type { ActiveSession, SessionSource } from '@app/game/randomizer-client';
import type { PanelPlacement } from '../Randomizer.type';

interface RunSummaryProps {
  placement: PanelPlacement;
  profileName: string;
  config: ProfileRandomizerConfig;
  session: ActiveSession | null;
  source: SessionSource | null;
  status: ActiveSession['status'];
  gameRunning: boolean;
  onOpenNetwork: () => void;
}

export type { RunSummaryProps };
