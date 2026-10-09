/* @layer renderer-stores @kind constants */
import type { HubSignInFailure } from '@shared/ipc';

const FAILURE_TEXT: Record<HubSignInFailure, string> = {
  denied: 'The device was refused on the site.',
  expired: 'The code expired before it was confirmed.',
  cancelled: '',
  unavailable: 'This system cannot keep a sign-in encrypted.',
  error: 'Could not reach the site.',
};

export { FAILURE_TEXT };
