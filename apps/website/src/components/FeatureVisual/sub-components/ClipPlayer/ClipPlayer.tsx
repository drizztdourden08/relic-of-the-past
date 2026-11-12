/* @layer website-site @kind component */
import { Video } from '../../../../design';
import { publicFileUrl } from '../../../../public-file';
import { useReducedMotion } from '../../behavior/useReducedMotion';
import type { ClipPlayerProps } from './ClipPlayer.type';

const ClipPlayer = ({ clip }: ClipPlayerProps) => {
  const reduced = useReducedMotion();
  const { src, poster } = clip;

  return (
    <Video
      key={src}
      src={publicFileUrl(src)}
      poster={publicFileUrl(poster.src)}
      width={poster.width}
      height={poster.height}
      autoPlay={!reduced}
      looping
      preload="metadata"
      aria-label={poster.alt}
    />
  );
};

export { ClipPlayer };
