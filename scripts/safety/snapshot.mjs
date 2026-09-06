/* @layer tooling-scripts @kind logic */
/**
 * Point-in-time snapshots of the gitignored material, kept as commits under
 * refs/safety/* (see roots.mjs), which no push can carry. Built with git plumbing
 * against a temporary index (GIT_INDEX_FILE), so a snapshot never stages anything,
 * moves HEAD or touches the working tree. HEAD is the parent only so the commit reads
 * normally in log and diff tools.
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

/** `YYYYMMDD-HHMMSS` in local time, so it sorts correctly and reads unambiguously. */
const stamp = (now = new Date()) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-` +
         `${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
};

/**
 * Write a tree of HEAD's tracked content plus the current on-disk state of every
 * protected root, via a throwaway index. Returns the tree sha.
 */
const buildTree = () => {
  const indexFile = join(tmpdir(), `rotp-safety-${process.pid}-${Date.now()}.index`);
  const env = { GIT_INDEX_FILE: indexFile };
  try {
    git(['read-tree', 'HEAD'], env);
    for (const root of PROTECTED_ROOTS) {
      if (!existsSync(join(repoRoot, root))) continue;
      // -f overrides .gitignore: these paths are ignored by design.
      git(['add', '-f', '--', root], env);
    }
    return git(['write-tree'], env).trim();
  } finally {
    rmSync(indexFile, { force: true });
  }
};

// The stamp is second-precision; without this, two snapshots with one label in the
// same second would resolve to one ref and `update-ref` would overwrite the first.
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

/** Take a snapshot and point `refs/safety/<label>-<stamp>` at it. `label` names the guarded operation. */
const createSnapshot = (label) => {
  const ref = uniqueRef(`${SAFETY_NAMESPACE}/${label}-${stamp()}`);
  const tree = buildTree();
  const message = `safety: ${label} snapshot\n\nProtected roots captured before a destructive operation.\nKept outside refs/heads so no push can carry it: it holds ROMs and save data.\n`;
  const commit = git(['commit-tree', tree, '-p', 'HEAD', '-m', message]).trim();
  git(['update-ref', ref, commit]);
  return { ref, commit, tree };
};

/**
 * Compare a snapshot against disk now, restricted to the protected roots, as a
 * tree-to-tree diff. Returns `{ ok, missing, changed }`; `missing` is the failure this
 * exists for.
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

// One `git cat-file --batch` for every blob. The stream is `<sha> blob <size>\n<size bytes>\n`
// per entry, walked as a Buffer so binary ROMs, saves and PNGs survive intact.
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
 * Put protected files back from a snapshot. Not `git checkout <ref> -- <path>`: that
 * stages what it restores and would start tracking gitignored ROMs. Not
 * `git archive | tar` either: it needs a shell, and Windows backslash paths reached
 * tar mangled.
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
