/* @layer bridge-wasm @kind constants */
import type { RoomMessageKind } from '../message-log';

const KIND_OF_TYPE: Readonly<Record<string, RoomMessageKind>> = {
  ItemSend: 'item',
  ItemCheat: 'item',
  Hint: 'hint',
  Chat: 'chat',
  ServerChat: 'chat',
  Join: 'join',
  Part: 'join',
};

export { KIND_OF_TYPE };
