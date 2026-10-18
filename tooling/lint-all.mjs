/* @layer tooling-scripts @kind logic */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const source = /\.(?:[cm]?[jt]s|[jt]sx)$/i;
const maxFilesPerRun = 1200;
const ignored = /(^|\/)(?:\.brock|node_modules|dist)(\/|$)|^core\/zelda3\/|^tooling\/(?:sync-check|lint-changed)\//;
const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'])
  .toString('utf8').split('\0').filter((path) => source.test(path) && !ignored.test(path.replaceAll('\\', '/')) && existsSync(path));

const root = { files: [], dirs: new Map(), count: 0 };
for (const path of new Set(tracked)) {
  const parts = path.replaceAll('\\', '/').split('/');
  let node = root;
  node.count++;
  for (const part of parts.slice(0, -1)) {
    if (!node.dirs.has(part)) node.dirs.set(part, { files: [], dirs: new Map(), count: 0 });
    node = node.dirs.get(part);
    node.count++;
  }
  node.files.push(path);
}

const targets = [];
const collect = (node, path) => {
  if (path && node.count <= maxFilesPerRun) {
    targets.push({ path, count: node.count });
    return;
  }
  for (const file of node.files) targets.push({ path: file, count: 1 });
  for (const [name, child] of node.dirs) collect(child, path ? `${path}/${name}` : name);
};
collect(root, '');

const eslint = join('node_modules', 'eslint', 'bin', 'eslint.js');
let batch = [];
let count = 0;
let failed = false;
const run = () => {
  if (batch.length === 0) return;
  console.log(`ESLint: ${count} source files across ${batch.length} paths`);
  const result = spawnSync(process.execPath, [eslint, '--no-warn-ignored', ...batch], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) failed = true;
  batch = [];
  count = 0;
};
for (const target of targets) {
  if (count + target.count > maxFilesPerRun) run();
  batch.push(target.path);
  count += target.count;
}
run();
if (failed) process.exitCode = 1;
