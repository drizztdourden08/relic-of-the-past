/* @layer website-site @kind component */
import { CompareStage } from '../CompareStage';
import { ShotFrame } from '../ShotFrame';
import type { VisualProps } from '../../FeatureVisual.type';

const CompareVisual = ({ visual, caption }: VisualProps<'compare'>) => (
  <ShotFrame caption={caption} framed={false}>
    <CompareStage before={visual.before} after={visual.after} labels={visual.labels} axis={visual.axis} />
  </ShotFrame>
);

export { CompareVisual };
