/* @layer shared-storage @kind logic */
import { isRecord } from '../../validation/is-record';
import type { RspManifest } from '../rsp.type';

const isRspManifest = (value: unknown): value is RspManifest =>
  isRecord(value) && value.format === 'rsp'
  && isRecord(value.palettes) && Boolean(value.palettes.original) && Boolean(value.meta);

export { isRspManifest };
