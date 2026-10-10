/* @layer tooling-scripts @kind logic */
import { createSnapshot, restoreFrom, verifyAgainst } from './snapshot.mjs';
import { listSnapshots, pruneSnapshots, selectExpired } from './retention.mjs';
import { PROTECTED_ROOTS } from './roots.mjs';

const show = (snapshots) => {
  if (snapshots.length === 0) {
    console.log('No snapshots.');
    return;
  }
  const { expire } = selectExpired(snapshots);
  const doomed = new Set(expire.map((s) => s.ref));
  for (const s of snapshots) {
    const age = s.ageDays < 1 ? `${Math.round(s.ageDays * 24)}h` : `${Math.floor(s.ageDays)}d`;
    console.log(`  ${s.name.padEnd(40)} ${s.sha}  ${age.padStart(4)} old${doomed.has(s.ref) ? '   -> prune' : ''}`);
  }
};

const reportVerify = (ref, result) => {
  if (result.ok) {
    const differ = result.changed.length ? ` (${result.changed.length} file(s) differ in content)` : '';
    console.log(`ok: nothing from ${ref} is missing on disk${differ}`);
    return true;
  }
  console.error(`\nFAIL: ${result.missing.length} protected file(s) present in ${ref} are GONE from disk:`);
  for (const p of result.missing.slice(0, 20)) console.error(`    ${p}`);
  if (result.missing.length > 20) console.error(`    ...and ${result.missing.length - 20} more`);
  console.error(`\nGet them back with:  pnpm safety restore ${ref}\n`);
  return false;
};

const requireRef = (arg, command) => {
  if (!arg) throw new Error(`Usage: pnpm safety ${command} <branch-or-sha>`);
  return arg;
};

const COMMANDS = {
  snapshot: (arg) => {
    const { ref, commit } = createSnapshot(arg ?? 'manual');
    console.log(`Snapshot ${ref} (${commit.slice(0, 8)})`);
    console.log(`Captured: ${PROTECTED_ROOTS.join(', ')}`);
  },
  list: () => show(listSnapshots()),
  verify: (arg) => {
    const ref = requireRef(arg, 'verify');
    if (!reportVerify(ref, verifyAgainst(ref))) process.exitCode = 1;
  },
  restore: (arg) => {
    const ref = requireRef(arg, 'restore');
    const { files, roots } = restoreFrom(ref);
    console.log(files > 0
      ? `Restored ${files} file(s) from ${ref}: ${roots.join(', ')}`
      : `${ref} holds none of the protected roots.`);
  },
  prune: () => {
    const removed = pruneSnapshots();
    console.log(removed.length ? `Pruned:\n  ${removed.join('\n  ')}` : 'Nothing to prune.');
  },
};

const run = () => {
  const [command, arg] = process.argv.slice(2);
  const handler = Object.hasOwn(COMMANDS, command ?? '') ? COMMANDS[command] : null;
  if (handler) {
    handler(arg);
    return;
  }
  console.log('Usage: pnpm safety snapshot [label] | list | verify <ref> | restore <ref> | prune');
};

try {
  run();
} catch (err) {
  console.error(`[safety] ${err.message}`);
  process.exitCode = 1;
}
