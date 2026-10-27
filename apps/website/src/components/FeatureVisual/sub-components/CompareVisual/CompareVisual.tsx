/* @layer website-site @kind component */
import { aspectOf } from '../../behavior/aspect-of';
import { CompareStage } from '../CompareStage';
import { Expandable } from '../Expandable';
import { ShotFrame } from '../ShotFrame';
import type { VisualProps } from '../../FeatureVisual.type';

const CompareVisual = ({ visual, caption }: VisualProps<'compare'>) => {
  const { before, after, labels, axis } = visual;
  const stage = <CompareStage before={before} after={after} labels={labels} axis={axis} />;

  return (
    <ShotFrame caption={caption} framed={false}>
      <Expandable aspect={aspectOf(before)} label={caption} expanded={stage}>
        {stage}
      </Expandable>
    </ShotFrame>
  );
};

export { CompareVisual };
