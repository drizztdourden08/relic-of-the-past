/* @layer tooling-scripts @kind logic */
/**
 * Local-only gate wired into .githooks/commit-msg. Checks whether either
 * gitignored mirror — .claude/ (ai-config) or the vault checkout — is currently
 * carrying local-only work that would be silently lost: a hand-edit to a
 * rendered ai-config file (overwritten by the next bootstrap render), or an
 * uncommitted change in the vault (which nothing else holds a record of).
 *
 * Read-only and offline: no clone, no fetch, no network call at all — so it
 * works identically with or without access to either private repo, and degrades
 * to "nothing to report" the moment either mirror isn't set up. Exits 1
 * (blocking the commit) only when real local-only work is found; [sync-ack] in
 * the commit message bypasses this entire check.
 *
 * An unpushed vault commit is reported but does not block — see vault-check.mjs
 * for why the two are weighted differently.
 */
import { checkAiConfig } from './ai-config-check.mjs';
import { checkVault } from './vault-check.mjs';
import { printReport } from './print.mjs';

const ai = checkAiConfig();
const vault = checkVault();
const blocking = ai.status === 'drift' || vault.status === 'dirty';

printReport({ ai, vault, blocking });
process.exit(blocking ? 1 : 0);
