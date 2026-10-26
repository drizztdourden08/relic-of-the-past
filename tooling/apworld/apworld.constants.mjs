/* @layer tooling-scripts @kind constants */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODULE_NAME = 'relic_of_the_past';
const PACKAGE_DIR = path.join(ROOT, 'integrations', 'archipelago', MODULE_NAME);
const OUT_DIR = path.join(ROOT, 'build', 'archipelago');
const PUBLIC_DIR = path.join(ROOT, 'apps', 'desktop', 'public', 'archipelago');
const APP_PACKAGE_JSON = path.join(ROOT, 'apps', 'desktop', 'package.json');

const AUTHORS = ['Relic of the Past'];

const abs = (rel) => path.join(ROOT, rel);

export { abs, APP_PACKAGE_JSON, AUTHORS, MODULE_NAME, OUT_DIR, PACKAGE_DIR, PUBLIC_DIR, ROOT };
