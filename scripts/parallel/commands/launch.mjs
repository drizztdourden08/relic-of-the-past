/* @layer tooling-scripts @kind logic */
/**
 * `wt launch <name> [-- <app flags>]`: run the built app (dist/electron/main.js) from
 * the worktree's own directory as a named instance. Flags after `--` are forwarded
 * (--auto-state, --screenshot, --dump-nav, --sim-run).
 *
 *   pnpm wt launch big-key -- --auto-state=test-jail-cell --screenshot=check
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { surveyOne } from '../survey.mjs';
import { launchArgs } from '../launch-line.mjs';

const run = async ({ positional }) => {
  const [name, ...extra] = positional;
  if (!name) throw new Error('Usage: pnpm wt launch <name> [-- <app flags>]');

  const entry = surveyOne(name);
  if (!entry) throw new Error(`No worktree named "${name}". Run: pnpm wt list`);
  if (entry.status.missing) throw new Error(`"${name}" has no checkout on disk. Run: pnpm wt doctor`);

  const { path } = entry.record;
  if (!existsSync(join(path, 'apps', 'desktop', 'dist', 'electron', 'main.js'))) {
    throw new Error(`No build in ${path}. Run "pnpm --filter ./apps/desktop build" there first (pnpm run build deletes dist).`);
  }

  const args = launchArgs(name, extra);
  console.log(`[wt] ${path}> pnpm exec electron ${args.join(' ')}`);

  const child = spawn('pnpm', ['exec', 'electron', ...args], { cwd: path, stdio: 'inherit', shell: process.platform === 'win32' });
  await new Promise((done) => child.on('close', (code) => {
    process.exitCode = code ?? 0;
    done();
  }));
};

const command = {
  summary: 'Run the built app from a worktree as a named instance',
  usage: 'pnpm wt launch <name> [-- <app flags>]',
  run,
};

export { command };
