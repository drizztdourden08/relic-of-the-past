/* @layer bridge-wasm @kind logic */
import type { RoomMessageKind } from '../message-log';
import { KIND_OF_TYPE } from './online-messages.constants';

const kindOfPrint = (type: string | undefined): RoomMessageKind => KIND_OF_TYPE[type ?? ''] ?? 'server';

export { kindOfPrint };
