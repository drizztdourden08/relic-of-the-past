/* @layer renderer-components @kind types */
import type { PatternValue } from '@drizztdourden08/tessera/composites';
import type { LobbyConnect, LobbyDraft, LobbyLocation } from '@app/hooks/randomizer/lobby-setup';

interface LobbyRow {
  id: string;
  name: string;
  address: string;
  ap?: string;
  supported: boolean;
  open: boolean;
  seats: string;
}

type LobbyLineState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'ok'; name: string; ap: string; approval: boolean; seats: readonly string[]; open?: { total: number; free: number } }
  | { kind: 'error'; text: string };

interface LobbyAccess {
  refreshing: boolean;
  onRefresh: () => void;
  blocked: boolean;
  onAllow: () => void;
}

interface LobbySetupProps {
  value: LobbyDraft;
  onChange: (part: Partial<LobbyDraft>) => void;
  lobbies: readonly LobbyRow[];
  lobby: LobbyLineState;
  access?: LobbyAccess;
  disabled?: boolean;
}

interface RefreshButtonProps {
  access: LobbyAccess;
  disabled: boolean;
}

interface NetworkWarningProps {
  onAllow: () => void;
}

interface LobbyRowsProps {
  lobbies: readonly LobbyRow[];
  picked: string | null;
  onPick: (lobby: LobbyRow) => void;
  disabled: boolean;
}

interface LobbyCodeFieldProps {
  value: PatternValue;
  onChange: (next: PatternValue) => void;
  error?: string;
  disabled: boolean;
}

interface ConnectionSectionProps {
  value: LobbyDraft;
  onChange: (part: Partial<LobbyDraft>) => void;
  lobbies: readonly LobbyRow[];
  lobby: LobbyLineState;
  access?: LobbyAccess;
  disabled: boolean;
}

interface ConnectModeProps {
  mode: LobbyConnect;
  location: LobbyLocation;
  onChange: (mode: LobbyConnect) => void;
  disabled: boolean;
}

interface RemoteAddressProps {
  value: PatternValue;
  onChange: (next: PatternValue) => void;
  disabled: boolean;
}

interface SeatFieldProps {
  seats: readonly string[];
  picked: string | null;
  onPick: (seat: string | null) => void;
  disabled: boolean;
}

interface LobbyLineProps {
  state: LobbyLineState;
}

export type {
  ConnectModeProps, ConnectionSectionProps, LobbyCodeFieldProps, LobbyLineProps, LobbyAccess, LobbyLineState, LobbyRow, LobbyRowsProps, LobbySetupProps,
  NetworkWarningProps, RefreshButtonProps, RemoteAddressProps, SeatFieldProps,
};
