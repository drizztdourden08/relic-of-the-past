/* @layer renderer-components @kind types */
import type { SoundRowProps } from './msu.type';

type SoundPlayButtonsProps = Pick<
  SoundRowProps,
  'row' | 'channel' | 'playing' | 'additive' | 'playingOriginal' | 'onPreview' | 'onStopPreview' | 'onPlayOriginal'
>;

export type { SoundPlayButtonsProps };
