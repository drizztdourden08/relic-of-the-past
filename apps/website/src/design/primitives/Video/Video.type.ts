/* @layer website-site @kind types */
import type { Ref, VideoHTMLAttributes } from 'react';

type VideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'controls'> & {
  looping?: boolean;
  ref?: Ref<HTMLVideoElement>;
};

export type { VideoProps };
