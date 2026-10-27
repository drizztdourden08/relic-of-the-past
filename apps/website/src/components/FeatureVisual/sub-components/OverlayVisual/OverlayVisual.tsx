/* @layer website-site @kind component */
import { Box, List, ListItem } from '@drizztdourden08/tessera/primitives';
import { ShotImage } from '../../../ShotImage';
import { ShotFrame } from '../ShotFrame';
import { frameStyleOf } from './behavior/frame-style-of';
import type { VisualProps } from '../../FeatureVisual.type';
import './OverlayVisual.css';

const OverlayVisual = ({ visual, caption }: VisualProps<'overlay'>) => (
  <ShotFrame caption={caption} framed={false}>
    <Box className="overlay-visual">
      <Box className="overlay-visual__stage">
        <ShotImage shot={visual.wide} className="overlay-visual__wide" />
        <Box className="overlay-visual__frame" style={frameStyleOf(visual.frame)}>
          <ShotImage shot={visual.original} className="overlay-visual__original" />
        </Box>
      </Box>
      <List className="overlay-visual__ratios" aria-label="Supported aspect ratios">
        {visual.ratios.map((ratio) => (
          <ListItem key={ratio} bare className="overlay-visual__ratio">
            {ratio}
          </ListItem>
        ))}
      </List>
    </Box>
  </ShotFrame>
);

export { OverlayVisual };
