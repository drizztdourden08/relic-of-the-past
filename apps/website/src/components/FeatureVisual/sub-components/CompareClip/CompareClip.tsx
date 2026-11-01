/* @layer website-site @kind component */
import { Box, Video } from '../../../../design';
import { publicFileUrl } from '../../../../public-file';
import type { CompareClipProps } from './CompareClip.type';

const CompareClip = ({ clip, still, alt, className, ref }: CompareClipProps) => (
  <Box className={className}>
    <Video
      key={clip.src}
      ref={ref}
      src={publicFileUrl(clip.src)}
      poster={publicFileUrl(still.src)}
      width={still.width}
      height={still.height}
      preload="metadata"
      aria-label={alt}
    />
  </Box>
);

export { CompareClip };
