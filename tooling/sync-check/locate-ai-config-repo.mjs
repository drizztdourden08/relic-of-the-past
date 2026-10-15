/* @layer tooling-scripts @kind logic */
// The ai-config source repo, if checked out beside the main checkout (same search as
// tooling/vault/locate.mjs, and the same worktree caveat). Best-effort: a miss only
// makes the drift message generic.
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { mainCheckout } from '@rotp/vault/locate';

const locateAiConfigRepo = () => {
  const candidate = resolve(mainCheckout(), '..', 'claude-config');
  return existsSync(join(candidate, 'ai', 'bootstrap.mjs')) ? candidate : null;
};

export { locateAiConfigRepo };
