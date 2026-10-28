/* @layer tooling-scripts @kind constants */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODULE_NAME = 'relic_of_the_past';
const PACKAGE_DIR = path.join(ROOT, 'integrations', 'archipelago', MODULE_NAME);
const OUT_DIR = path.join(ROOT, 'build', 'archipelago');
const PUBLIC_DIR = path.join(ROOT, 'apps', 'desktop', 'public', 'archipelago');
const APP_PACKAGE_JSON = path.join(ROOT, 'apps', 'desktop', 'package.json');

const RELEASE_ASSETS_DIR = path.join(ROOT, 'apps', 'desktop', 'release-assets');
const THUMBNAIL = path.join(RELEASE_ASSETS_DIR, 'archipelia-thumbnail.png');
const DESCRIPTION = path.join(RELEASE_ASSETS_DIR, 'archipelia-description.md');

const AUTHORS = ['Relic of the Past'];

const abs = (rel) => path.join(ROOT, rel);

export {
  abs, APP_PACKAGE_JSON, AUTHORS, DESCRIPTION, MODULE_NAME, OUT_DIR, PACKAGE_DIR, PUBLIC_DIR, RELEASE_ASSETS_DIR, ROOT, THUMBNAIL,
};
