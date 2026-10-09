/* @layer renderer-lib @kind logic */
import type { Identity } from '@rotp/hub-contracts';

const githubHandleOf = (identities: Identity[]): string | null =>
  identities.find((identity) => identity.provider === 'github')?.handle ?? null;

export { githubHandleOf };
