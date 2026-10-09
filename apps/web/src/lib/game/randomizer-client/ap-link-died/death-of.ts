/* @layer bridge-wasm @kind logic */
import { CAUSE_BY_ROOM } from './ap-link-died.constants';
import type { LinkDeath } from './ap-link-died.type';

const deathOf = (cause: unknown): LinkDeath => ({
  byRoom: cause === CAUSE_BY_ROOM,
  text: typeof cause === 'string' ? cause : '',
});

export { deathOf };
