/* @layer website-site @kind component */
import { Image } from '../../design';
import { publicFileUrl } from '../../public-file';
import type { ShotImageProps } from './ShotImage.type';

const ShotImage = ({ shot, className, alt, ratio }: ShotImageProps) => (
  <Image
    className={className}
    src={publicFileUrl(shot.src)}
    alt={alt ?? shot.alt}
    aspectRatio={ratio ?? `${shot.width} / ${shot.height}`}
    loading="lazy"
    decoding="async"
  />
);

export { ShotImage };
