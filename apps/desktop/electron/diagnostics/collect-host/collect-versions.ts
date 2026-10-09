/* @layer electron-main @kind logic */
import type { RuntimeVersions } from '@shared/types/diagnostics';

const collectVersions = (): RuntimeVersions => ({
  node: process.versions.node ?? 'unknown',
  v8: process.versions.v8 ?? 'unknown',
  chrome: process.versions.chrome ?? 'unknown',
  electron: process.versions.electron ?? 'unknown',
});

export { collectVersions };
