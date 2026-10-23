/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { SvgCircle } from '@drizztdourden08/tessera/primitives';
import { HALO_PAD } from '../PadOverlay.constants';
import type { OverlayHaloProps } from '../PadOverlay.type';

const OverlayHalo = ({ part, level }: OverlayHaloProps) => {
  const style = { '--pad-overlay-level': level } as CSSProperties;
  return <SvgCircle className="pad-overlay__halo" cx={part.x} cy={part.y} r={part.radius + HALO_PAD} style={style} />;
};

export { OverlayHalo };
