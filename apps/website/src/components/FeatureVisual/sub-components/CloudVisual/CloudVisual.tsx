/* @layer website-site @kind component */
import { CloudStage } from '../CloudStage';
import { Expandable } from '../Expandable';
import { ShotFrame } from '../ShotFrame';
import { CLOUD_ASPECT } from './CloudVisual.constants';
import type { VisualProps } from '../../FeatureVisual.type';
import './CloudVisual.css';

const CloudVisual = ({ visual, caption }: VisualProps<'cloud'>) => (
  <ShotFrame caption={caption} framed={false}>
    <Expandable aspect={CLOUD_ASPECT} label={caption} expanded={<CloudStage words={visual.words} />}>
      <CloudStage words={visual.words} />
    </Expandable>
  </ShotFrame>
);

export { CloudVisual };
