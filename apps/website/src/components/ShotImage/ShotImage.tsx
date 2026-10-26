/* @layer website-site @kind component */
import { Image } from '@drizztdourden08/tessera/primitives';
import { publicFileUrl } from '../../public-file';
import type { ShotImageProps } from './ShotImage.type';

const ShotImage = ({ shot, className }: ShotImageProps) => (
  <Image
    className={className}
    src={publicFileUrl(shot.src)}
    alt={shot.alt}
    aspectRatio={`${shot.width} / ${shot.height}`}
    loading="lazy"
    decoding="async"
  />
);

export { ShotImage };
