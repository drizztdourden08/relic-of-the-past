/* @layer website-site @kind types */
import type { VideoClip, VideoStep } from '../../../../features';

type SoundVideoProps = {
  clip: VideoClip;
  steps?: readonly VideoStep[];
  caption: string;
};

export type { SoundVideoProps };
