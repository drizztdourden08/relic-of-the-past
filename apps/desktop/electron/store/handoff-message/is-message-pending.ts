/* @layer electron-main @kind logic */
import { MAX_MESSAGE_CHARS } from './handoff-message.constants';

const isMessagePending = (received: string): boolean =>
  received.length <= MAX_MESSAGE_CHARS && !received.includes('\n');

export { isMessagePending };
