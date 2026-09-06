/* @layer test @kind test */
/**
 * Regression test for the most dangerous operation in the worktree tooling.
 * A worktree used to share the record dataset with the main repo through a
 * junction, and `git worktree remove --force` walks INTO a junction and
 * deletes what it points at (it emptied the real .claude once). Links must be
 * detached first, WITHOUT touching contents.
 *
 * .claude is COPIED now because of that incident, and the record dataset is an
 * ordinary tracked directory that no longer needs linking at all (see
 * LINKED_DIRS in link-deps.mjs, now empty). The mechanism itself stays for the
 * next gitignored-but-regenerable directory that needs it, so this exercises
 * it with a synthetic linked-dir name passed explicitly, not through the
 * (now empty) production LINKED_DIRS.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, existsSync, rmSync, readdirSync, symlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
// @ts-expect-error -- plain .mjs tooling module, no type declarations by design
import { assertNoSharedLinks, unlinkSharedDirs } from '../../scripts/parallel/link-deps.mjs';

const ROOT = join(tmpdir(), 'rotp-link-deps-test');
const TARGET = join(ROOT, 'shared-target');
const WORKTREE = join(ROOT, 'worktree');
const LINKED_NAME = 'example-linked-dir';
const LINK = join(WORKTREE, LINKED_NAME);
const CANARY = join(TARGET, 'screens', 'canary.md');

/** Create the link exactly the way link-deps does on this platform. */
const makeLink = () => {
  if (process.platform === 'win32') {
    execFileSync('cmd', ['/c', 'mklink', '/J', resolve(LINK), resolve(TARGET)], { stdio: 'ignore' });
  } else {
    symlinkSync(TARGET, LINK, 'dir');
  }
};

beforeEach(() => {
  rmSync(ROOT, { recursive: true, force: true });
  mkdirSync(join(TARGET, 'screens'), { recursive: true });
  writeFileSync(CANARY, 'precious\n');
  mkdirSync(WORKTREE, { recursive: true });
  makeLink();
});

afterEach(() => {
  // Detach before cleaning up, or the cleanup itself is the hazard under test.
  unlinkSharedDirs(WORKTREE, [LINKED_NAME]);
  rmSync(ROOT, { recursive: true, force: true });
});

describe('unlinkSharedDirs', () => {
  it('removes the link and leaves the shared contents untouched', () => {
    expect(existsSync(join(LINK, 'screens', 'canary.md'))).toBe(true);

    unlinkSharedDirs(WORKTREE, [LINKED_NAME]);

    expect(existsSync(LINK)).toBe(false);
    expect(existsSync(CANARY)).toBe(true);
    expect(readdirSync(join(TARGET, 'screens'))).toEqual(['canary.md']);
  });

  it('is safe to call when no links are present', () => {
    unlinkSharedDirs(WORKTREE, [LINKED_NAME]);
    expect(() => unlinkSharedDirs(WORKTREE, [LINKED_NAME])).not.toThrow();
  });
});

describe('assertNoSharedLinks', () => {
  it('throws while a shared link is still in place', () => {
    expect(() => assertNoSharedLinks(WORKTREE)).toThrow(/link\(s\) still present/);
  });

  it('names the directory that would be destroyed', () => {
    expect(() => assertNoSharedLinks(WORKTREE)).toThrow(/example-linked-dir/);
  });

  it('passes once the links are detached', () => {
    unlinkSharedDirs(WORKTREE, [LINKED_NAME]);
    expect(() => assertNoSharedLinks(WORKTREE)).not.toThrow();
  });
});
