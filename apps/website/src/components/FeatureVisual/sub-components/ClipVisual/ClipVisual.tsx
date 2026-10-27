/* @layer website-site @kind component */
import { CompareVisual } from '../CompareVisual';
import { useReducedMotion } from './behavior/useReducedMotion';
import { CLIP_LABELS } from './ClipVisual.constants';
import type { VisualProps } from '../../FeatureVisual.type';

const ClipVisual = ({ visual, caption }: VisualProps<'clip'>) => {
  const reduced = useReducedMotion();

  return (
    <CompareVisual
      visual={{
        kind: 'compare',
        before: reduced ? visual.poster : visual.loop,
        after: visual.after,
        labels: CLIP_LABELS,
        axis: 'x',
      }}
      caption={caption}
    />
  );
};

export { ClipVisual };
