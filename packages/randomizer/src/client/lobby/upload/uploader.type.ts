/* @layer bridge-wasm @kind types */
import type { ServerMessage } from '@drizztdourden08/archipelia-lobby-protocol';
import type { LobbyProblem } from '../failure';
import type { PreparedFile } from '../join/prepared-join.type';
import type { LobbyLink } from '../link/lobby-link.type';
import type { LobbyEvent } from '../session/lobby-event.type';

type UploaderDeps = {
  link: LobbyLink;
  files: Map<string, PreparedFile>;
  chunkBytes: number;
  emit: (event: LobbyEvent) => void;
  fail: (problem: LobbyProblem) => void;
  onIdle: () => void;
};

type Uploader = {
  start: (queue: string[]) => void;
  handle: (message: ServerMessage) => boolean;
  cancel: () => void;
};

type CurrentUpload = { file: PreparedFile; seq: number; attempt: number };

type UploadState = { queue: string[]; current: CurrentUpload | null; cancelled: boolean };

export type { CurrentUpload, UploadState, Uploader, UploaderDeps };
