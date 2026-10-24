/* @layer bridge-wasm @kind types */
import type {
  EngineRef,
  LobbyPhase,
  MemberAdmission,
  RoomState,
  RoomTls,
  StartedFile,
  StateSlot,
  TrustLevel,
  UploadKind,
  Welcome,
} from '@archipelia/lobby-protocol';
import type { LobbyFailure, LobbyProblem } from '../failure';

type LobbyStatus =
  | 'connecting'
  | 'uploading'
  | 'pending'
  | 'approved'
  | 'generating'
  | 'started'
  | 'refused'
  | 'removed'
  | 'failed'
  | 'closed';

type UploadProgress = { sha256: string; kind: UploadKind; size: number; sent: number; done: boolean };

type StartedRoom = {
  address: string;
  host: string;
  port: number;
  tls: RoomTls;
  password?: string;
  roomUrl?: string;
};

type StartedSlot = { name: string; game: string; team: number; files: StartedFile[] };

type LobbyStart = { seed: string; engine: EngineRef; room: StartedRoom; slots: StartedSlot[] };

type LobbyProgress = { phase: LobbyPhase; step: string; fraction: number };

type LobbyEnd = 'refused' | 'removed' | 'closed';

type LobbyJoinState = {
  status: LobbyStatus;
  token: string | null;
  memberId: string | null;
  resumed: boolean;
  trust: TrustLevel | null;
  admission: MemberAdmission | null;
  admissionReason: string | null;
  lobby: Welcome['lobby'] | null;
  phase: LobbyPhase | null;
  uploads: UploadProgress[];
  uploadsDone: boolean;
  slots: StateSlot[];
  others: { approved: number; pending: number } | null;
  ready: boolean;
  progress: LobbyProgress | null;
  generationFailure: { stage: string; message: string } | null;
  started: LobbyStart | null;
  room: { state: RoomState; address: string | null } | null;
  problem: LobbyProblem | null;
  failure: LobbyFailure | null;
  reconnecting: boolean;
  end: LobbyEnd | null;
  forgetToken: boolean;
};

export type {
  LobbyEnd,
  LobbyJoinState,
  LobbyProgress,
  LobbyStart,
  LobbyStatus,
  StartedRoom,
  StartedSlot,
  UploadProgress,
};
