/* @layer website-site @kind component */
import { Box, List, ListItem } from '@drizztdourden08/tessera/primitives';
import { ShotImage } from '../../../ShotImage';
import { PinMarks } from '../PinMarks';
import { ShotFrame } from '../ShotFrame';
import type { VisualProps } from '../../FeatureVisual.type';
import './PinsVisual.css';

const PinsVisual = ({ visual, caption }: VisualProps<'pins'>) => (
  <ShotFrame caption={caption}>
    <Box className="pins-visual">
      <ShotImage shot={visual.shot} />
      <PinMarks callouts={visual.callouts} />
    </Box>
    <List ordered className="pins-visual__legend">
      {visual.callouts.map((callout) => (
        <ListItem key={callout.label} className="pins-visual__item">
          {callout.label}
        </ListItem>
      ))}
    </List>
  </ShotFrame>
);

export { PinsVisual };
