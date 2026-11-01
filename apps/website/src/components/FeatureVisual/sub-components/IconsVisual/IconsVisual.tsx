/* @layer website-site @kind component */
import { Box, Image, Span } from '../../../../design';
import { publicFileUrl } from '../../../../public-file';
import { DepthLayer } from '../../../DepthLayer';
import { ShotFrame } from '../ShotFrame';
import { DEPTH_CYCLE } from './IconsVisual.constants';
import type { VisualProps } from '../../FeatureVisual.type';
import './IconsVisual.css';

const IconsVisual = ({ visual, caption }: VisualProps<'icons'>) => (
  <ShotFrame caption={caption} framed={false}>
    <Box className="icons-visual">
      {visual.icons.map((icon, index) => (
        <DepthLayer
          key={icon.id}
          depth={DEPTH_CYCLE[index % DEPTH_CYCLE.length] ?? 'mid'}
          className={index === 0 ? 'icons-visual__tile icons-visual__tile--hero' : 'icons-visual__tile'}
        >
          <Image src={publicFileUrl(icon.src)} alt="" aspectRatio="1 / 1" pixelated fit="contain" className="icons-visual__icon" />
          <Span className="icons-visual__name">{icon.name}</Span>
        </DepthLayer>
      ))}
    </Box>
  </ShotFrame>
);

export { IconsVisual };
