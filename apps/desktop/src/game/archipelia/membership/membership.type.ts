/* @layer bridge-wasm @kind types */
import type { LobbyStart } from '@rotp/randomizer';

type GoneReason = 'closed' | 'not-found' | 'resume-invalid' | 'unsupported';

type MembershipState =
  | { kind: 'pending' }
  | { kind: 'approved' }
  | { kind: 'failed'; message: string }
  | { kind: 'refused'; reason: string }
  | { kind: 'gone'; reason: GoneReason }
  | { kind: 'started' };

interface ArchipeliaMembership {
  server: string;
  code: string;
  ap: string;
  lobbyName: string;
  memberId: string;
  token?: string;
  state: MembershipState;
  updatedAt: number;
}

interface MembershipStep {
  membership: ArchipeliaMembership;
  promote: LobbyStart | null;
  room: string | null;
}

export type { ArchipeliaMembership, GoneReason, MembershipState, MembershipStep };
