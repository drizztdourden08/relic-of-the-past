/* @layer tooling-scripts @kind build */
/**
 * Builds the world packages when they are missing or older than their sources, so dev, the
 * desktop package and the web build all find them in apps/desktop/public/archipelago.
 *
 *   pnpm run ensure-apworld        (force a rebuild with: pnpm run build:apworld)
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_PACKAGE_JSON, OUT_DIR, PACKAGE_DIR, PUBLIC_DIR, ROOT } from './apworld.constants.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BUILT_INDEX = path.join(PUBLIC_DIR, 'builds.json');
const RELEASE_INDEX = path.join(OUT_DIR, 'relic_of_the_past.apworld.json');
const IGNORED_NAMES = new Set(['node_modules', '__pycache__']);

const SOURCE_ROOTS = [PACKAGE_DIR, HERE, path.join(ROOT, 'packages')];

/** The newest modification time under a path, dependency folders left out. */
const newestUnder = (target) => {
  const stat = statSync(target);
  if (!stat.isDirectory()) return stat.mtimeMs;
  return readdirSync(target)
    .filter((name) => !IGNORED_NAMES.has(name))
    .reduce((newest, name) => Math.max(newest, newestUnder(path.join(target, name))), 0);
};

const isCurrent = () => {
  if (!existsSync(BUILT_INDEX) || !existsSync(RELEASE_INDEX)) return false;
  const builtAt = statSync(BUILT_INDEX).mtimeMs;
  return [APP_PACKAGE_JSON, ...SOURCE_ROOTS].every((source) => newestUnder(source) <= builtAt);
};

if (isCurrent()) {
  console.log('ensure-apworld: up to date');
} else {
  const build = spawnSync(process.execPath, [path.join(HERE, 'build-apworld.mjs')], { stdio: 'inherit' });
  process.exit(build.status ?? 1);
}
