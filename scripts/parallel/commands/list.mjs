/* @layer tooling-scripts @kind logic */
/**
 * `wt list`: every worktree, its verdict (derived live from git), and what it was last
 * used for. `--json` prints the same survey for an agent to read directly.
 */
import { surveyAll } from '../survey.mjs';
import { describeLease } from '../lease.mjs';
import { flag } from '../args.mjs';
import { worktreeRoot } from '../paths.mjs';

const COLUMNS = [
  ['NAME', 16],
  ['VERDICT', 12],
  ['DRIFT', 12],
  ['MERGED', 7],
  ['LEASE', 26],
  ['PROMPTS', 8],
];

const drift = ({ dirty, ahead, behind }) => {
  const parts = [];
  if (dirty) parts.push('dirty');
  if (ahead) parts.push(`+${ahead}`);
  if (behind) parts.push(`-${behind}`);
  return parts.length ? parts.join(' ') : 'clean';
};

const lastNote = (record) => record.notes?.[record.notes.length - 1] ?? null;

const printTable = (entries) => {
  console.log(COLUMNS.map(([label, width]) => label.padEnd(width)).join(''));
  console.log(COLUMNS.map(([, width]) => '─'.repeat(width - 1).padEnd(width)).join(''));

  for (const { record, status, assessment } of entries) {
    const row = [
      record.name,
      assessment.verdict + (assessment.staleLease ? '*' : ''),
      status.missing ? '-' : drift(status),
      status.missing ? '-' : status.merged ? 'yes' : 'no',
      describeLease(record.lease),
      String(record.notes?.length ?? 0),
    ];
    console.log(row.map((cell, i) => String(cell).padEnd(COLUMNS[i][1])).join(''));
  }

  const stale = entries.some((e) => e.assessment.staleLease);
  if (stale) console.log('\n* lease expired, so the pool treats it as free');

  for (const { record } of entries) {
    const note = lastNote(record);
    if (note) console.log(`\n${record.name}: ${note.prompt}`);
  }
};

const run = async ({ options }) => {
  const entries = surveyAll();

  if (flag(options, 'json')) {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }

  if (entries.length === 0) {
    console.log(`No agent worktrees yet. Create one with:\n  npm run wt -- new <name>\n\nPool root: ${worktreeRoot}`);
    return;
  }

  printTable(entries);
};

const command = {
  summary: 'Show every worktree with its live verdict',
  usage: 'npm run wt -- list [--json]',
  run,
};

export { command };
