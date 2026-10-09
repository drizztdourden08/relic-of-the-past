/* @layer shared-storage @kind logic */
import { MSU1_CHANNELS, MSU1_SAMPLE_RATE, msu1FrameCount } from '../msu1-format';
import { extensionOf } from './extension-of';
import { MSU1_BIT_RATE } from './msu.constants';
import type { MsuFileMetadata } from './msu.type';

const baseMetadata = (name: string, bytes: number): MsuFileMetadata => {
  const ext = extensionOf(name);
  const isPcm = ext === 'pcm';
  return {
    name,
    size: bytes,
    ext,
    durationSeconds: isPcm ? msu1FrameCount(bytes) / MSU1_SAMPLE_RATE : null,
    sampleRate: isPcm ? MSU1_SAMPLE_RATE : null,
    channels: isPcm ? MSU1_CHANNELS : null,
    bitRate: isPcm ? MSU1_BIT_RATE : null,
  };
};

export { baseMetadata };
