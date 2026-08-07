/* @layer tooling-scripts @kind logic */
/**
 * Local-only gate wired into .githooks/commit-msg. Checks whether either
 * gitignored mirror — .claude/ (ai-config) or .vault/ (rotp-vault) — is
 * currently carrying local-only work that would be silently lost: a hand-edit
 * to a rendered ai-config file (overwritten by the next bootstrap render), or
 * an uncommitted change inside .vault (never sent upstream via vault:push).
 *
 * Read-only and offline: no clone, no fetch, no network call at all — so it
 * works identically with or without access to either private repo, and
 * degrades to "nothing to report" the moment either mirror isn't set up.
 * Exits 1 (blocking the commit) only when real local-only work is found;
 * [sync-ack] in the commit message bypasses this entire check.
 */
import { checkAiConfig } from './ai-config-check.mjs';
import { checkVault } from './vault-check.mjs';
import { printReport } from './print.mjs';

const ai = checkAiConfig();
const vault = checkVault();
const blocking = ai.status === 'drift' || vault.status === 'dirty';

printReport({ ai, vault });
process.exit(blocking ? 1 : 0);
