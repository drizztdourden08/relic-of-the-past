/* @layer shared-game @kind data */
import type { KnownFormat } from './save-state.type';

const KNOWN_FORMATS: readonly KnownFormat[] = [
  {
    id: '6895039d1993',
    since: '0.1.0',
    note: 'Original layout. Every release up to and including 0.17.1 wrote this.',
  },
] as const;

const BASELINE = { upToVersion: '0.17.1', id: '6895039d1993' } as const;

export { BASELINE, KNOWN_FORMATS };
