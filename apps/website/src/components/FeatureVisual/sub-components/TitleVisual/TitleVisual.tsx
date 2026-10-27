/* @layer website-site @kind component */
import { Box, Video } from '../../../../design';
import { publicFileUrl } from '../../../../public-file';
import { ShotImage } from '../../../ShotImage';
import { useReducedMotion } from '../../behavior/useReducedMotion';
import { ShotFrame } from '../ShotFrame';
import type { VisualProps } from '../../FeatureVisual.type';
import './TitleVisual.css';

const TitleVisual = ({ visual, caption }: VisualProps<'title'>) => {
  const { video, swords } = visual;
  const reduced = useReducedMotion();

  return (
    <ShotFrame caption={caption} framed={false}>
      <Box className="title-visual">
        <Box className="title-visual__screen">
          <Video
            src={publicFileUrl(video.src)}
            poster={publicFileUrl(video.poster.src)}
            autoPlay={!reduced}
            looping
            preload="metadata"
            aria-label={video.poster.alt}
          />
        </Box>
        {swords.length > 0 ? (
          <Box className="title-visual__swords">
            {swords.map((sword) => (
              <ShotImage key={sword.id} shot={sword} ratio="1 / 1" className="title-visual__sword" />
            ))}
          </Box>
        ) : null}
      </Box>
    </ShotFrame>
  );
};

export { TitleVisual };
