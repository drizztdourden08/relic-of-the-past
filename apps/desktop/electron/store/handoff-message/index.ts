/* @layer electron-main @kind barrel */
export { formatHandoffMessage } from './format-handoff-message';
export { parseHandoffMessage } from './parse-handoff-message';
export { isMessagePending } from './is-message-pending';
export { ACK, NACK, MAX_MESSAGE_CHARS } from './handoff-message.constants';
