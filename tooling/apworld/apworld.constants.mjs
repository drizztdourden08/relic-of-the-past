/* @layer tooling-scripts @kind constants */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MODULE_NAME = 'relic_of_the_past';
const PACKAGE_DIR = path.join(ROOT, 'integrations', 'archipelago', MODULE_NAME);
const DATA_DIR = path.join(PACKAGE_DIR, 'data');
const MANIFEST_FILE = path.join(PACKAGE_DIR, 'archipelago.json');
const OUT_DIR = path.join(ROOT, 'build', 'archipelago');
const PUBLIC_DIR = path.join(ROOT, 'apps', 'desktop', 'public', 'archipelago');
const APP_PACKAGE_JSON = path.join(ROOT, 'apps', 'desktop', 'package.json');

/** Folders and files the zip leaves out. */
const SKIPPED = new Set(['__pycache__']);

/** The zip entries' fixed time, so repeat builds give the same bytes. */
const FIXED_DATE = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));

/** The container version of the apworld manifest. */
const CONTAINER_VERSION = 7;

const TEXT_EXTENSIONS = new Set(['.py', '.json', '.md', '.txt']);

const abs = (rel) => path.join(ROOT, rel);

export {
  abs, APP_PACKAGE_JSON, CONTAINER_VERSION, DATA_DIR, FIXED_DATE, MANIFEST_FILE, MODULE_NAME, OUT_DIR,
  PACKAGE_DIR, PUBLIC_DIR, ROOT, SKIPPED, TEXT_EXTENSIONS,
};
