/* @layer website-site @kind component */
import { Box } from '../../../../design';
import { DepthLayer } from '../../../DepthLayer';
import { ShotImage } from '../../../ShotImage';
import { ShotFrame } from '../ShotFrame';
import { ringStyleOf } from './behavior/ring-style-of';
import { LensDetail } from '../LensDetail';
import { LENS_LABELS } from './LensVisual.constants';
import type { VisualProps } from '../../FeatureVisual.type';
import './LensVisual.css';

const LensVisual = ({ visual, caption }: VisualProps<'lens'>) => {
  const { shot, lens, before, after } = visual;

  return (
    <ShotFrame caption={caption} framed={false}>
      <Box className="lens-visual">
        <Box className="lens-visual__stage">
          <ShotImage shot={shot} />
          <Box className="lens-visual__ring" style={ringStyleOf(lens)} aria-hidden="true" />
        </Box>
        <DepthLayer depth="front" className="lens-visual__details">
          <LensDetail shot={before} label={LENS_LABELS.before} />
          <LensDetail shot={after} label={LENS_LABELS.after} />
        </DepthLayer>
      </Box>
    </ShotFrame>
  );
};

export { LensVisual };
