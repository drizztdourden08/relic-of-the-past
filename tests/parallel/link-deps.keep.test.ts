/* @layer test @kind test */
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
