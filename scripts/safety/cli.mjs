/* @layer tooling-scripts @kind logic */
/**
 * `npm run safety -- <command>` — hand control of the snapshots to a person.
 *
 *   snapshot [label]   take one now
 *   list               every snapshot, newest first, and what retention would do
 *   verify <ref>       compare a snapshot against what is on disk now
 *   restore <ref>      write the snapshot's protected files back over the working tree
 *   prune              apply retention (older than 7 days, but never below the last 2)
 *
 * The destructive operations take snapshots on their own; this is for looking at them,
 * getting something back by hand, and clearing them out.
 */
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
    console.log(`✓ nothing from ${ref} is missing on disk` +
      (result.changed.length ? ` (${result.changed.length} file(s) differ in content)` : ''));
    return true;
  }
  console.error(`\n✗ ${result.missing.length} protected file(s) present in ${ref} are GONE from disk:`);
  for (const p of result.missing.slice(0, 20)) console.error(`    ${p}`);
  if (result.missing.length > 20) console.error(`    …and ${result.missing.length - 20} more`);
  console.error(`\nGet them back with:  npm run safety -- restore ${ref}\n`);
  return false;
};

const run = () => {
  const [command, arg] = process.argv.slice(2);

  if (command === 'snapshot') {
    const { ref, commit } = createSnapshot(arg ?? 'manual');
    console.log(`Snapshot ${ref} (${commit.slice(0, 8)})`);
    console.log(`Captured: ${PROTECTED_ROOTS.join(', ')}`);
    return;
  }
  if (command === 'list') {
    show(listSnapshots());
    return;
  }
  if (command === 'verify') {
    if (!arg) throw new Error('Usage: npm run safety -- verify <branch-or-sha>');
    if (!reportVerify(arg, verifyAgainst(arg))) process.exitCode = 1;
    return;
  }
  if (command === 'restore') {
    if (!arg) throw new Error('Usage: npm run safety -- restore <branch-or-sha>');
    const { files, roots } = restoreFrom(arg);
    console.log(files > 0
      ? `Restored ${files} file(s) from ${arg}: ${roots.join(', ')}`
      : `${arg} holds none of the protected roots.`);
    return;
  }
  if (command === 'prune') {
    const removed = pruneSnapshots();
    console.log(removed.length ? `Pruned:\n  ${removed.join('\n  ')}` : 'Nothing to prune.');
    return;
  }

  console.log('Usage: npm run safety -- snapshot [label] | list | verify <ref> | restore <ref> | prune');
};

try {
  run();
} catch (err) {
  console.error(`[safety] ${err.message}`);
  process.exitCode = 1;
}
