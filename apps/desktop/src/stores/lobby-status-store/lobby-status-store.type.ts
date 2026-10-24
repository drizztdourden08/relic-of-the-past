/* @layer renderer-stores @kind types */
import type { ArchipeliaMembership } from '@app/game/archipelia/membership/membership.type';

interface LobbyLive {
  connected: boolean;
  progress: { phase: string; fraction: number } | null;
}

interface LobbyStatusState {
  members: Readonly<Record<string, ArchipeliaMembership>>;
  live: Readonly<Record<string, LobbyLive>>;
  setMember: (profileId: string, membership: ArchipeliaMembership) => void;
  setLive: (profileId: string, live: LobbyLive) => void;
  drop: (profileId: string) => void;
}

export type { LobbyLive, LobbyStatusState };
