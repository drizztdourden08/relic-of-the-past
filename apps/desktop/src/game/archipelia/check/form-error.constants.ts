/* @layer bridge-wasm @kind constants */
const UNVERIFIED = 'This RotP build could not be verified. Update RotP.';

const FORM_ERRORS: Readonly<Record<string, string>> = {
  'lobby-not-found': 'No lobby with this code.',
  'lobby-closed': 'This lobby has ended.',
  'lobby-locked': 'This lobby has started. New players cannot join.',
  'lobby-full': 'This lobby is full.',
  'refused': 'The host refused this player.',
  'slot-name-taken': 'Another player has this slot name.',
  'trust-failed': UNVERIFIED,
  'client-revoked': UNVERIFIED,
  'unlisted-not-allowed': UNVERIFIED,
};

const UNREACHABLE_CODES: readonly string[] = ['connection-failed', 'connection-lost', 'timeout', 'closed'];

export { FORM_ERRORS, UNREACHABLE_CODES };
