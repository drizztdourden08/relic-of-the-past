/* @layer website-site @kind types */
import type { VideoHTMLAttributes } from 'react';

type VideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'controls'> & {
  looping?: boolean;
};

export type { VideoProps };
