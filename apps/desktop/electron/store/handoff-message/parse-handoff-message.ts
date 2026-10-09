/* @layer electron-main @kind logic */
import { parseInstallLink } from '@shared/store/deep-link';
import type { InstallLink } from '@shared/store/deep-link';
import { MAX_MESSAGE_CHARS } from './handoff-message.constants';

const parseHandoffMessage = (received: string): InstallLink | null => {
  if (received.length > MAX_MESSAGE_CHARS) return null;
  const end = received.indexOf('\n');
  if (end === -1 || end !== received.length - 1) return null;
  return parseInstallLink(received.slice(0, end));
};

export { parseHandoffMessage };
