/* @layer bridge-wasm @kind logic */
import { ROW_COMMANDS, SCROLL_COMMAND, WAIT_COMMAND } from '../message-commands.constants';
import { wrapRows } from './wrap-rows';

const wrapMessageText = (text: string, alphabet: readonly string[], widths: Uint8Array): string =>
  wrapRows(text, alphabet, widths)
    .map((line, i) => `${i < ROW_COMMANDS.length ? ROW_COMMANDS[i] : `${WAIT_COMMAND}${SCROLL_COMMAND}`}${line}`)
    .join('');

export { wrapMessageText };
