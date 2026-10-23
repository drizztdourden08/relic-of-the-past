/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { StickPlot } from '@drizztdourden08/tessera/composites';
import { resolveLiveControlState } from '@rotp/input-mapping';
import type { StickReadoutProps } from '../ControllerPage.type';
import { AxisActions } from './AxisActions';
import { AxisReadout } from './AxisReadout';
import { SignedBar } from './SignedBar';

const StickReadout = ({ pair, pairIdx, state, onCalibrate }: StickReadoutProps) => {
  const x = resolveLiveControlState(pair.xControl, state.buttons, state.axes).value;
  const y = resolveLiveControlState(pair.yControl, state.buttons, state.axes).value;
  const getValues = useCallback(() => [x, y], [x, y]);
  const calibrate = useCallback(
    () => onCalibrate({ type: 'stick', side: pairIdx === 0 ? 'left' : 'right' }),
    [onCalibrate, pairIdx],
  );
  const actions = <AxisActions label={pair.label} getValues={getValues} onCalibrate={calibrate} />;

  return (
    <AxisReadout name={pair.label} variant="stick" plot={<StickPlot x={x} y={y} showValue={false} />} actions={actions}>
      <SignedBar label="X" value={x} />
      <SignedBar label="Y" value={-y} />
    </AxisReadout>
  );
};

export { StickReadout };
