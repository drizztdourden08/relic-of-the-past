/* @layer website-site @kind component */
import { ShotImage } from '../../../ShotImage';
import { aspectOf } from '../../behavior/aspect-of';
import { Expandable } from '../Expandable';
import { ShotFrame } from '../ShotFrame';
import type { VisualProps } from '../../FeatureVisual.type';

const SingleVisual = ({ visual, caption }: VisualProps<'single'>) => (
  <ShotFrame caption={caption}>
    <Expandable aspect={aspectOf(visual.shot)} label={caption} expanded={<ShotImage shot={visual.shot} />}>
      <ShotImage shot={visual.shot} />
    </Expandable>
  </ShotFrame>
);

export { SingleVisual };
