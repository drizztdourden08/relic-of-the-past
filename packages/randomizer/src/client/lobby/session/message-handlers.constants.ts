/* @layer bridge-wasm @kind constants */
import { onFileChunk } from '../files/on-file-chunk';
import { onFileDone } from '../files/on-file-done';
import type { MessageHandlers } from './message-handlers.type';
import { onAdmission } from './on-admission';
import { onError } from './on-error';
import { onGenerationFailed } from './on-generation-failed';
import { onInfoReply } from './on-info-reply';
import { onLobbyState } from './on-lobby-state';
import { onProgress } from './on-progress';
import { onRoomStatus } from './on-room-status';
import { onSlotsOk } from './on-slots-ok';
import { onStarted } from './on-started';
import { onWelcome } from './on-welcome';

const MESSAGE_HANDLERS: MessageHandlers = {
  'lobby.info.reply': onInfoReply,
  welcome: onWelcome,
  error: onError,
  admission: onAdmission,
  'lobby.state': onLobbyState,
  'lobby.progress': onProgress,
  'lobby.started': onStarted,
  'lobby.failed': onGenerationFailed,
  'room.status': onRoomStatus,
  'slots.ok': onSlotsOk,
  'file.chunk': onFileChunk,
  'file.done': (ctx, message) => {
    void onFileDone(ctx, message);
  },
  'upload.ready': () => undefined,
  'upload.done': () => undefined,
};

export { MESSAGE_HANDLERS };
