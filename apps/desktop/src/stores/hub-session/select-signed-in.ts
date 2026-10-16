/* @layer renderer-stores @kind logic */
import type { HubSessionStore } from './hub-session.type';

const selectSignedIn = (session: HubSessionStore): boolean => session.state === 'signed-in' && session.me !== null;

export { selectSignedIn };
