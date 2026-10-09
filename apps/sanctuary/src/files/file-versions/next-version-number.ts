/* @layer sanctuary-site @kind logic */
import type { Versioned } from './file-versions.type';

const nextVersionNumber = (file: Versioned): number =>
  file.versions.reduce((highest, version) => Math.max(highest, version.n), 0) + 1;

export { nextVersionNumber };
