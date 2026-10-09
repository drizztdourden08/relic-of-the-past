/* @layer renderer-lib @kind logic */
import type { PlayerSheet } from '@rotp/game-data';
import type { RspManifest, RspSource, RspExtras } from '@shared/storage/link-sprites/rsp.type';
import { RSP_VERSION } from '@shared/storage/link-sprites/rsp.type';

const manifestOf = (sheet: PlayerSheet, source?: RspSource, extras?: RspExtras): RspManifest => ({
  format: 'rsp',
  version: RSP_VERSION,
  meta: sheet.meta,
  palettes: { original: sheet.original, override: sheet.override },
  ...(extras ? { extras } : {}),
  ...(source ? { source } : {}),
});

export { manifestOf };
