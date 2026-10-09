/* @layer renderer-lib @kind logic */
import type { Identity } from '@shared/hub';

const githubHandleOf = (identities: Identity[]): string | null =>
  identities.find((identity) => identity.provider === 'github')?.handle ?? null;

export { githubHandleOf };
