/* @layer shared-hud @kind logic */
import { validateLayout } from '../validate-layout';
import type { LoadResult } from './load-layout.type';

const tryLoadLayout = (value: unknown): LoadResult => {
  const { doc, errors, warnings } = validateLayout(value);
  return doc ? { ok: true, doc, warnings } : { ok: false, errors };
};

export { tryLoadLayout };
