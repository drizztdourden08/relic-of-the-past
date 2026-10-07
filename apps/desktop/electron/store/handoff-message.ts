/* @layer electron-main @kind logic */
/**
 * What crosses the hand-off pipe: one install link on one line, answered with one line.
 * Anything else is refused, since the pipe is open to every process of this user: an
 * oversized message, a second line, or text that is not exactly an install link.
 */
import { formatInstallLink, parseInstallLink } from '@shared/store/deep-link';
import type { InstallLink } from '@shared/store/deep-link';

/** An install link is at most 256 characters; this leaves room for the line end and nothing more. */
const MAX_MESSAGE_CHARS = 260;
const ACK = 'ok\n';
const NACK = 'no\n';

const formatHandoffMessage = (link: InstallLink): string => `${formatInstallLink(link)}\n`;

/** The link, once a whole line has arrived; null while it is incomplete or when it is refused. */
const parseHandoffMessage = (received: string): InstallLink | null => {
  if (received.length > MAX_MESSAGE_CHARS) return null;
  const end = received.indexOf('\n');
  if (end === -1 || end !== received.length - 1) return null;
  return parseInstallLink(received.slice(0, end));
};

/** Whether the text so far can still become a message: under the cap and at most one line. */
const isMessagePending = (received: string): boolean =>
  received.length <= MAX_MESSAGE_CHARS && !received.includes('\n');

export { formatHandoffMessage, parseHandoffMessage, isMessagePending, ACK, NACK, MAX_MESSAGE_CHARS };
