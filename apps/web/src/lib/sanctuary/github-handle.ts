/* @layer renderer-lib @kind logic */
/** The linked GitHub login, the one identity a filed issue will mention; null when unlinked. */
import type { Identity } from '@shared/hub';

const githubHandleOf = (identities: Identity[]): string | null =>
  identities.find((identity) => identity.provider === 'github')?.handle ?? null;

export { githubHandleOf };
