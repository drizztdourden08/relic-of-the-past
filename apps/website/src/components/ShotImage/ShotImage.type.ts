/* @layer website-site @kind types */
import type { Screenshot } from '../../features';

type ShotImageProps = {
  shot: Screenshot;
  className?: string;
  alt?: string;
  ratio?: string;
};

export type { ShotImageProps };
