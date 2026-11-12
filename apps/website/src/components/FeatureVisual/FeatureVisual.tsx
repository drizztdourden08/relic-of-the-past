/* @layer website-site @kind component */
import { VISUAL_RENDERERS } from './FeatureVisual.constants';
import type { AnyRenderer, FeatureVisualProps } from './FeatureVisual.type';

const FeatureVisual = ({ visual, caption }: FeatureVisualProps) => {
  const Renderer = VISUAL_RENDERERS[visual.kind] as AnyRenderer;

  return <Renderer visual={visual} caption={caption} />;
};

export { FeatureVisual };
