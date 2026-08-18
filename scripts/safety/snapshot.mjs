/* @layer tooling-scripts @kind logic */
/**
 * Point-in-time snapshots of the gitignored material, kept as commits in a private ref
 * namespace (refs/safety/*, see roots.mjs) that no push can carry.
 *
 * Built entirely with git plumbing against a TEMPORARY index (GIT_INDEX_FILE), so taking
 * a snapshot never stages anything, never moves HEAD and never touches the working tree.
 * That matters: this runs immediately before destructive operations, and a safety net
 * that disturbs the thing it is protecting is not a safety net.
 *
 * The snapshot commit takes HEAD as its parent purely so it reads as a normal commit in
 * log and diff tools.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { repoRoot } from '../parallel/paths.mjs';
import { PROTECTED_ROOTS, SAFETY_NAMESPACE } from './roots.mjs';

const git = (args, extraEnv) =>
  execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: extraEnv ? { ...process.env, ...extraEnv } : process.env,
  });

/** `YYYYMMDD-HHMMSS` in local time — sorts correctly and reads unambiguously. */
const stamp = (now = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-` +
         `${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
};

/**
 * Write a tree containing HEAD's tracked content plus the CURRENT on-disk state of every
 * protected root, forced past .gitignore. Uses a throwaway index file so the real one is
 * untouched. Returns the tree sha.
 */
const buildTree = () => {
  const indexFile = join(tmpdir(), `rotp-safety-${process.pid}-${Date.now()}.index`);
  const env = { GIT_INDEX_FILE: indexFile };
  try {
    git(['read-tree', 'HEAD'], env);
    for (const root of PROTECTED_ROOTS) {
      if (!existsSync(join(repoRoot, root))) continue;
      // -f overrides .gitignore, which is the whole point: these paths are ignored by
      // design and would otherwise be invisible to the snapshot.
      git(['add', '-f', '--', root], env);
    }
    return git(['write-tree'], env).trim();
  } finally {
    rmSync(indexFile, { force: true });
  }
};

/**
 * The stamp is only second-precision, so two snapshots sharing a label within the same
 * second would resolve to one ref and `update-ref` would quietly overwrite the first.
 * Unlikely, and silent if it ever happened, which is the wrong combination for this file.
 */
const uniqueRef = (base) => {
  const taken = (ref) => {
    try {
      git(['rev-parse', '--verify', '--quiet', ref]);
      return true;
    } catch {
      return false;
    }
  };
  if (!taken(base)) return base;
  let n = 2;
  while (taken(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
};

/**
 * Take a snapshot and point `refs/safety/<label>-<stamp>` at it.
 * `label` names the operation being guarded, e.g. `wt-clean` or `vault-sync`.
 */
const createSnapshot = (label) => {
  const ref = uniqueRef(`${SAFETY_NAMESPACE}/${label}-${stamp()}`);
  const tree = buildTree();
  const message = `safety: ${label} snapshot\n\nProtected roots captured before a destructive operation.\nKept outside refs/heads so no push can carry it: it holds ROMs and save data.\n`;
  const commit = git(['commit-tree', tree, '-p', 'HEAD', '-m', message]).trim();
  git(['update-ref', ref, commit]);
  return { ref, commit, tree };
};

/**
 * Compare a snapshot against what is on disk NOW, restricted to the protected roots.
 *
 * Implemented as a tree-to-tree diff rather than per-file hashing: build a fresh tree the
 * same way, then let git tell us what changed. Two plumbing calls instead of one process
 * per file, and it reuses git's own comparison rather than a hand-rolled one.
 *
 * Returns `{ ok, missing, changed }`. `missing` is what matters — a protected file that
 * was in the snapshot and is no longer on disk is precisely the failure this exists for.
 */
const verifyAgainst = (ref) => {
  const before = git(['rev-parse', `${ref}^{tree}`]).trim();
  const after = buildTree();
  const missing = [];
  const changed = [];
  if (before !== after) {
    const out = git(['diff-tree', '-r', '--name-status', before, after, '--', ...PROTECTED_ROOTS]);
    for (const line of out.split('\n').filter(Boolean)) {
      const [status, ...rest] = line.split('\t');
      const path = rest.join('\t');
      if (status.startsWith('D')) missing.push(path);
      else changed.push(path);
    }
  }
  return { ok: missing.length === 0, missing, changed };
};

/**
 * Read every blob named by `entries` in ONE `git cat-file --batch` process and write it
 * to disk. The batch stream is `<sha> blob <size>\n<size bytes>\n` per entry, walked as a
 * Buffer rather than a string so ROMs, save states and PNGs survive the trip intact.
 */
const writeBlobs = (entries) => {
  const stdout = execFileSync('git', ['cat-file', '--batch'], {
    cwd: repoRoot,
    input: `${entries.map((e) => e.sha).join('\n')}\n`,
    maxBuffer: 1024 * 1024 * 1024,
  });
  let at = 0;
  for (const entry of entries) {
    const nl = stdout.indexOf(0x0a, at);
    const size = Number(stdout.toString('utf8', at, nl).split(' ')[2]);
    const start = nl + 1;
    const target = join(repoRoot, entry.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, stdout.subarray(start, start + size));
    at = start + size + 1;  // +1 for the newline git appends after each blob
  }
  return entries.length;
};

/**
 * Put protected files back from a snapshot.
 *
 * Deliberately NOT `git checkout <ref> -- <path>`: that stages what it restores, which
 * would quietly start tracking gitignored ROMs and save data. Deliberately not
 * `git archive | tar` either — the pipeline needs a shell, and a Windows path with
 * backslashes reaches tar mangled, which is how the first version of this failed.
 * Reading blobs and writing them ourselves involves neither.
 */
const restoreFrom = (ref, roots = PROTECTED_ROOTS) => {
  const listing = git(['ls-tree', '-r', '-z', ref, '--', ...roots]);
  const entries = listing.split('\0').filter(Boolean).map((line) => {
    const [meta, path] = line.split('\t');
    return { sha: meta.split(/\s+/)[2], path };
  });
  if (entries.length === 0) return { files: 0, roots: [] };
  writeBlobs(entries);
  return { files: entries.length, roots: [...new Set(entries.map((e) => e.path.split('/')[0]))] };
};

export { buildTree, createSnapshot, restoreFrom, stamp, verifyAgainst };
