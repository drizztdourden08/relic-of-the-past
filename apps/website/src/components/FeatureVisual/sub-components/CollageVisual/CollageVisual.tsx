/* @layer website-site @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { DepthLayer } from '../../../DepthLayer';
import { ShotImage } from '../../../ShotImage';
import { PinMarks } from '../PinMarks';
import { ShotFrame } from '../ShotFrame';
import type { VisualProps } from '../../FeatureVisual.type';
import './CollageVisual.css';

const CollageVisual = ({ visual, caption }: VisualProps<'collage'>) => (
  <ShotFrame caption={caption} framed={false}>
    <Box className="collage-visual">
      {visual.layers.map(({ shot, slot, depth, callouts }) => (
        <DepthLayer key={shot.id} depth={depth} className={`collage-visual__layer collage-visual__layer--${slot}`}>
          <ShotImage shot={shot} className="collage-visual__shot" />
          {callouts ? <PinMarks callouts={callouts} /> : null}
        </DepthLayer>
      ))}
    </Box>
  </ShotFrame>
);

export { CollageVisual };
