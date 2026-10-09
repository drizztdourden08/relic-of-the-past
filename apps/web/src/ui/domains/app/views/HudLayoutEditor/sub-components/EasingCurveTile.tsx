/* @layer renderer-components @kind component */
import { Button, Svg, SvgPath } from '@drizztdourden08/tessera/primitives';
import { CURVE_BOX, curvePath } from '../behavior/easing-curves';
import type { EasingCurveTileProps } from './EasingPicker.type';

const EasingCurveTile = (props: EasingCurveTileProps) => {
  const { name, label, on, onPick } = props;
  return (
    <Button
      variant="bare"
      className={`hud-easing__tile${on ? ' is-on' : ''}`}
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={onPick}
    >
      <Svg viewBox={`0 0 ${CURVE_BOX} ${CURVE_BOX}`} className="hud-easing__curve" aria-hidden>
        <SvgPath d={curvePath(name)} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      </Svg>
    </Button>
  );
};

export { EasingCurveTile };
