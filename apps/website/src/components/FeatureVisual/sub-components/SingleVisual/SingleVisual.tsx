/* @layer website-site @kind component */
import { ShotImage } from '../../../ShotImage';
import { ShotFrame } from '../ShotFrame';
import type { VisualProps } from '../../FeatureVisual.type';

const SingleVisual = ({ visual, caption }: VisualProps<'single'>) => (
  <ShotFrame caption={caption}>
    <ShotImage shot={visual.shot} />
  </ShotFrame>
);

export { SingleVisual };
