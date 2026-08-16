/* @layer tooling-scripts @kind logic */
/**
 * Where the ai-config source repo lives, if it happens to be checked out on this
 * machine — the same "sibling checkout" search as the vault (scripts/vault/locate.mjs).
 * Best-effort only: rendering .claude/ never needs this repo present, so a miss just
 * means the drift message stays generic instead of naming the exact command to run.
 *
 * Reuses the vault's `mainCheckout()` because the same worktree problem applies here:
 * from a worktree (rotp-worktrees/<name>), `../claude-config` is a sibling of the
 * worktree, not of the repository, so a naive lookup would never find it.
 */
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { mainCheckout } from '../../vault/locate.mjs';

const locateAiConfigRepo = () => {
  const candidate = resolve(mainCheckout(), '..', 'claude-config');
  return existsSync(join(candidate, 'ai', 'bootstrap.mjs')) ? candidate : null;
};

export { locateAiConfigRepo };
