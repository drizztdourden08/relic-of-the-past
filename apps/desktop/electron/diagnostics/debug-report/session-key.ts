/* @layer electron-main @kind logic */
import { SESSION_KEY_PATTERN } from './session-key.constants';

const isSessionKey = (value: string): boolean => SESSION_KEY_PATTERN.test(value);

export { isSessionKey };
