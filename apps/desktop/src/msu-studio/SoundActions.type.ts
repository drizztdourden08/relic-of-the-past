/* @layer renderer-components @kind types */
import type { SoundRowProps } from './msu.type';

type SoundActionsProps = Pick<
  SoundRowProps,
  | 'row' | 'channel' | 'playing' | 'additive' | 'busy' | 'expanded' | 'playingOriginal' | 'readOnly'
  | 'onPreview' | 'onStopPreview' | 'onPlayOriginal' | 'onToggleLayers' | 'onStopReplacing'
>;

export type { SoundActionsProps };
