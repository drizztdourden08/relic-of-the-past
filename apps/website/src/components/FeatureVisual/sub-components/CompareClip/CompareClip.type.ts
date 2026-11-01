/* @layer website-site @kind types */
import type { Ref } from 'react';
import type { Screenshot, VideoClip } from '../../../../features';

type CompareClipProps = {
  clip: VideoClip;
  still: Screenshot;
  alt: string;
  className: string;
  ref: Ref<HTMLVideoElement>;
};

export type { CompareClipProps };
