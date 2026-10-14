/* @layer shared-storage @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { isRecord } from '../validation/is-record';

const isManifest = (value: unknown): value is MsuPackManifest =>
  isRecord(value) && value.version === 1 && Boolean(value.meta) && Array.isArray(value.tracks);

export { isManifest };
