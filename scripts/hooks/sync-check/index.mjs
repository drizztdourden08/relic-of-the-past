/* @layer tooling-scripts @kind logic */
/**
 * Local-only gate wired into .githooks/commit-msg: does .claude/ (ai-config) or the
 * vault checkout carry local-only work that would be silently lost? Read-only and
 * offline. Exits 1 only when such work is found; [sync-ack] in the commit message
 * bypasses the check. An unpushed vault commit is reported but does not block (see
 * vault-check.mjs).
 */
import { checkAiConfig } from './ai-config-check.mjs';
import { checkVault } from './vault-check.mjs';
import { printReport } from './print.mjs';

const ai = checkAiConfig();
const vault = checkVault();
const blocking = ai.status === 'drift' || vault.status === 'dirty';

printReport({ ai, vault, blocking });
process.exit(blocking ? 1 : 0);
