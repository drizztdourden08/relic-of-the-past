/* @layer bridge-wasm @kind logic */
import { REPLY_PATTERN } from './players-reply.constants';

const isPlayersReply = (text: string): boolean => REPLY_PATTERN.test(text.trim());

export { isPlayersReply };
