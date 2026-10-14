/* @layer renderer-components @kind types */
import type { TrackRowProps } from './msu.type';

type TrackActionsProps = Pick<
  TrackRowProps,
  | 'trackNum' | 'fileName' | 'playing' | 'busy' | 'expanded' | 'playingOriginal'
  | 'onPreview' | 'onStopPreview' | 'onPlayOriginal' | 'onToggleLayers'
>;

export type { TrackActionsProps };
