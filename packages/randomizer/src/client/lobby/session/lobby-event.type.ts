/* @layer bridge-wasm @kind types */
import type { LobbyState, MemberAdmission, RoomState, Welcome } from '@drizztdourden08/archipelia-lobby-protocol';
import type { LobbyFailure, LobbyProblem } from '../failure';
import type { LobbyInfo } from '../info';
import type { LobbyProgress, LobbyStart, UploadProgress } from './lobby-state.type';

type LobbyEvent =
  | { type: 'info'; info: LobbyInfo }
  | { type: 'connected'; url: string }
  | { type: 'welcome'; welcome: Welcome; uploads: UploadProgress[] }
  | { type: 'upload-progress'; sha256: string; sent: number }
  | { type: 'upload-done'; sha256: string }
  | { type: 'slots-ok'; uploads: UploadProgress[] }
  | { type: 'admission'; state: MemberAdmission; reason: string | null }
  | { type: 'lobby-state'; lobbyState: LobbyState }
  | { type: 'ready'; ready: boolean }
  | { type: 'progress'; progress: LobbyProgress }
  | { type: 'generation-failed'; stage: string; message: string }
  | { type: 'started'; started: LobbyStart }
  | { type: 'room'; state: RoomState; address: string | null }
  | { type: 'problem'; problem: LobbyProblem }
  | { type: 'reconnecting'; attempt: number; delayMs: number }
  | { type: 'failed'; failure: LobbyFailure }
  | { type: 'closed'; reason: 'left' | 'caller' };

export type { LobbyEvent };
