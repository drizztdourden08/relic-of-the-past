/* @layer website-site @kind types */
import type { AudioHTMLAttributes, Ref } from 'react';

type AudioProps = Omit<AudioHTMLAttributes<HTMLAudioElement>, 'controls' | 'autoPlay'> & {
  ref?: Ref<HTMLAudioElement>;
};

export type { AudioProps };
