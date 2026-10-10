/* @layer tooling-scripts @kind logic */
import { readdirSync, lstatSync, unlinkSync, rmdirSync, rmSync, chmodSync } from 'node:fs';
import { join } from 'node:path';

const attempt = (action) => {
  try {
    action();
    return true;
  } catch {
    return false;
  }
};

const readOrNull = (read) => {
  try {
    return read();
  } catch {
    return null;
  }
};

const forceUnlink = (path) => {
  if (attempt(() => unlinkSync(path))) return;
  const unlockedAndRemoved = attempt(() => {
    chmodSync(path, 0o666);
    unlinkSync(path);
  });
  if (!unlockedAndRemoved) rmSync(path, { force: true });
};

const removeLinkWithoutFollowing = (full) => {
  if (!attempt(() => unlinkSync(full))) attempt(() => rmdirSync(full));
};

const removeEntry = (full) => {
  const stat = readOrNull(() => lstatSync(full));
  if (stat === null) return 0;
  if (stat.isSymbolicLink()) {
    removeLinkWithoutFollowing(full);
    return 1;
  }
  if (stat.isDirectory()) {
    const links = removeTreeSafely(full);
    attempt(() => rmdirSync(full));
    return links;
  }
  forceUnlink(full);
  return 0;
};

const removeTreeSafely = (dir) => {
  const entries = readOrNull(() => readdirSync(dir, { withFileTypes: true }));
  if (entries === null) return 0;

  let links = 0;
  for (const entry of entries) links += removeEntry(join(dir, entry.name));

  attempt(() => rmdirSync(dir));
  return links;
};

export { removeTreeSafely };
