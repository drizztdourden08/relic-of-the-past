/* @layer renderer-components @kind types */
import type { PatternValue } from '@drizztdourden08/tessera/composites';
import type { DraftProblems, LobbyDraft } from '@app/hooks/randomizer/lobby-setup';

interface LanServerRow {
  id: string;
  name: string;
  address: string;
  ap: string;
  supported: boolean;
  open: boolean;
}

type LobbyLineState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'ok'; name: string; ap: string; approval: boolean }
  | { kind: 'error'; text: string };

interface LobbySetupProps {
  value: LobbyDraft;
  onChange: (part: Partial<LobbyDraft>) => void;
  servers: readonly LanServerRow[];
  lobby: LobbyLineState;
  invalid: DraftProblems;
  disabled?: boolean;
}

interface LanServerRowsProps {
  servers: readonly LanServerRow[];
  picked: string | null;
  onPick: (id: string) => void;
  disabled: boolean;
}

interface RemoteAddressProps {
  value: PatternValue;
  onChange: (next: PatternValue) => void;
  invalid: boolean;
  disabled: boolean;
}

interface LobbyLineProps {
  state: LobbyLineState;
}

export type { LanServerRow, LanServerRowsProps, LobbyLineProps, LobbyLineState, LobbySetupProps, RemoteAddressProps };
