/* @layer test @kind test */
/**
 * Regression test for the most dangerous operation in the worktree tooling.
 *
 * A worktree shares the record dataset with the main repo through a directory junction.
 * `git worktree remove --force` walks INTO a junction and deletes what it points at:
 * verified, it emptied the real .claude (skills, tools, settings) back when that was
 * linked too. So the links must be detached first, and detaching must remove the link
 * WITHOUT touching its contents.
 *
 * .claude is COPIED now, precisely because of that incident, so it is no longer the
 * subject here. This exercises whatever LINKED_DIRS actually holds, which is the record
 * dataset; pointing the test at a directory the tooling no longer links would leave the
 * dangerous operation untested while still looking green.
 *
 * These tests use a throwaway target; they never point a link at a real repo directory.
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
const LINKED_NAME = 'shared/game/data/records';
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
  mkdirSync(join(WORKTREE, 'shared', 'game', 'data'), { recursive: true });
  makeLink();
});

afterEach(() => {
  // Detach before cleaning up, or the cleanup itself is the hazard under test.
  unlinkSharedDirs(WORKTREE);
  rmSync(ROOT, { recursive: true, force: true });
});

describe('unlinkSharedDirs', () => {
  it('removes the link and leaves the shared contents untouched', () => {
    expect(existsSync(join(LINK, 'screens', 'canary.md'))).toBe(true);

    unlinkSharedDirs(WORKTREE);

    expect(existsSync(LINK)).toBe(false);
    expect(existsSync(CANARY)).toBe(true);
    expect(readdirSync(join(TARGET, 'screens'))).toEqual(['canary.md']);
  });

  it('is safe to call when no links are present', () => {
    unlinkSharedDirs(WORKTREE);
    expect(() => unlinkSharedDirs(WORKTREE)).not.toThrow();
  });
});

describe('assertNoSharedLinks', () => {
  it('throws while a shared link is still in place', () => {
    expect(() => assertNoSharedLinks(WORKTREE)).toThrow(/link\(s\) still present/);
  });

  it('names the directory that would be destroyed', () => {
    expect(() => assertNoSharedLinks(WORKTREE)).toThrow(/records/);
  });

  it('passes once the links are detached', () => {
    unlinkSharedDirs(WORKTREE);
    expect(() => assertNoSharedLinks(WORKTREE)).not.toThrow();
  });
});
