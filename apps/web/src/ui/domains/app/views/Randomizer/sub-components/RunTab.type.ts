/* @layer renderer-components @kind types */
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import type { ActiveSession, SessionSource } from '@app/lib/game/randomizer-client';
import type { ActivityLogProps } from './ActivityLog.type';

interface RunTabProps {
  profileId: string | null;
  profileName: string | null;
  config: ProfileRandomizerConfig | null;
  session: ActiveSession | null;
  source: SessionSource | null;
  status: ActiveSession['status'];
  gameRunning: boolean;
  log: ActivityLogProps;
  onOpenNetwork: () => void;
  onOpenOptions: () => void;
  onOpenLog: () => void;
}

export type { RunTabProps };
