/* @layer website-site @kind component */
import { Box } from '../../../../design';
import { ShotImage } from '../../../ShotImage';
import { aspectOf } from '../../behavior/aspect-of';
import { AudioBar } from '../AudioBar';
import { Expandable } from '../Expandable';
import { ShotFrame } from '../ShotFrame';
import type { VisualProps } from '../../FeatureVisual.type';
import './AudioVisual.css';

const AudioVisual = ({ visual, caption }: VisualProps<'audio'>) => (
  <ShotFrame caption={caption}>
    <Box className="audio-visual">
      <Expandable aspect={aspectOf(visual.shot)} label={caption} expanded={<ShotImage shot={visual.shot} />}>
        <ShotImage shot={visual.shot} />
      </Expandable>
      <AudioBar track={visual.track} />
    </Box>
  </ShotFrame>
);

export { AudioVisual };
