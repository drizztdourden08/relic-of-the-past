/* @layer sanctuary-site @kind logic */
import type { FileVersion } from '@rotp/hub-contracts';
import type { Versioned } from './file-versions.type';

const versionsNewestFirst = (file: Versioned): FileVersion[] =>
  file.versions.filter((version) => version.status === 'ready').sort((a, b) => b.n - a.n);

export { versionsNewestFirst };
