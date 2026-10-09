/* @layer site-kit @kind constants */
import type { SessionState } from './useSession.type';

const SIGNED_OUT: SessionState = { me: null, identities: [], groups: [], rights: null, loading: false, error: null };

export { SIGNED_OUT };
