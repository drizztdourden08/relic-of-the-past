/* @layer website-site @kind component */
import { Svg, SvgPath } from '@drizztdourden08/tessera/primitives';
import { GEM_CENTER, GEM_LAYERS, GEM_SIZE } from '../Separator.constants';
import { diamondPath } from '../behavior/diamond-path';

const CenterGem = () => (
  <Svg className="landing-separator__gem" width={GEM_SIZE} height={GEM_SIZE} viewBox={`0 0 ${GEM_SIZE} ${GEM_SIZE}`} aria-hidden="true">
    {GEM_LAYERS.map((layer) => (
      <SvgPath
        key={`${layer.radius}-${layer.shift}-${layer.fill}`}
        d={diamondPath(GEM_CENTER + layer.shift, GEM_CENTER + layer.shift, layer.radius)}
        fill={layer.fill}
      />
    ))}
  </Svg>
);

export { CenterGem };
