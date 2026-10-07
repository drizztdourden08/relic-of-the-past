/* @layer shared-storage @kind logic */
/**
 * Set-id validation. An id becomes a folder name and the value the config's
 * language key selects at boot, so it is restricted to lowercase letters,
 * digits and dashes. It must also not already be taken.
 */
import type { FileStore } from '@shared/platform';
import { setDir } from './paths';

const SET_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const assertValidSetId = (id: string): void => {
  if (!SET_ID_RE.test(id)) {
    throw new Error(
      `Invalid language set id "${id}": use lowercase letters, digits and dashes only `
      + '(e.g. "de" or "de-community").',
    );
  }
};

/** Valid *and* free: rejects an id whose folder already exists. */
const assertFreeSetId = async (files: FileStore, id: string): Promise<void> => {
  assertValidSetId(id);
  if (await files.exists(setDir(id))) throw new Error(`A language set with the id "${id}" already exists.`);
};

/** Lowercase, runs of anything else turned into one dash, never empty. */
const slugSetId = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'imported';

/** `wanted` when it is valid and free, else its slug with the first free numbered suffix. */
const pickFreeSetId = async (files: FileStore, wanted: string): Promise<string> => {
  const base = SET_ID_RE.test(wanted) ? wanted : slugSetId(wanted);
  if (!(await files.exists(setDir(base)))) return base;
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${base}-${n}`;
    if (!(await files.exists(setDir(candidate)))) return candidate;
  }
  return `${base}-${Date.now()}`;
};

export { assertFreeSetId, assertValidSetId, pickFreeSetId };
