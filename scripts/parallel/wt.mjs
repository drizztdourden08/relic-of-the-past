/* @layer tooling-scripts @kind logic */
/**
 * `wt` — the agent-worktree pool CLI.
 *
 *   npm run wt:list
 *   npm run wt -- claim --any --ttl 4h
 *   npm run wt -- new <name>
 *   npm run wt -- note <name> "<the chat prompt>"
 *
 * A dispatcher only: every verb is its own module under commands/, each exporting
 * `{ summary, usage, run }` (a Command). Adding a verb is adding a file — this file
 * never grows a switch, and no single file carries the whole CLI.
 *
 * Full workflow: docs/contributing/parallel-worktrees.md
 */
import { parseArgs } from './args.mjs';

const COMMANDS = [
  'new', 'list', 'claim', 'release', 'refresh', 'note', 'pr', 'launch', 'clean', 'doctor',
];

const loadCommand = async (name) => {
  if (!COMMANDS.includes(name)) return null;
  return (await import(`./commands/${name}.mjs`)).command;
};

const printHelp = async () => {
  console.log('Agent worktree pool\n');
  console.log('Usage: npm run wt -- <command> [args]\n');
  for (const name of COMMANDS) {
    const { summary } = await loadCommand(name);
    console.log(`  ${name.padEnd(9)} ${summary}`);
  }
  console.log('\nDetail: npm run wt -- <command> --help');
};

const run = async () => {
  const [verb, ...rest] = process.argv.slice(2);

  if (!verb || verb === 'help' || verb === '--help') {
    await printHelp();
    return;
  }

  const command = await loadCommand(verb);
  if (!command) {
    console.error(`[wt] Unknown command "${verb}". Try: ${COMMANDS.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const { positional, options } = parseArgs(rest);
  if (options.help === true) {
    console.log(command.usage);
    return;
  }

  await command.run({ positional, options });
};

run().catch((err) => {
  console.error(`[wt] ${err.message}`);
  process.exitCode = 1;
});
