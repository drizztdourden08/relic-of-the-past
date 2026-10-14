/* @layer renderer-components @kind logic */
import type { StickCandidate } from '../hid-calibration.type';
import { claimStickBytes } from './claim-stick-bytes';
import { describeAxisCandidate } from './describe-axis-candidate';
import { pickStickAxes } from './pick-stick-axes';
import type { StickFinalizeCallbacks, StickFinalizeRefs } from './stick-trigger-handlers.type';

const finalizeStickCalibration = (c1: StickCandidate, c2: StickCandidate | null, refs: StickFinalizeRefs, cb: StickFinalizeCallbacks): void => {
  const side = refs.activeStickRef.current ?? 'left';
  const label = side === 'left' ? 'LEFT' : 'RIGHT';
  const xId = side === 'left' ? 'leftX' : 'rightX';
  const yId = side === 'left' ? 'leftY' : 'rightY';

  const { x, y } = pickStickAxes(c1, c2);
  const xAxis = describeAxisCandidate(x);
  cb.addLog(`OK ${label} X: ${xAxis.result}`);

  const yAxis = y ? describeAxisCandidate(y) : null;
  const yResult = yAxis ? yAxis.result : 'skipped (single byte)';
  cb.addLog(yAxis ? `OK ${label} Y: ${yAxis.result}` : `  ${label} Y: skipped (single byte stick)`);

  const mins = refs.stickMinsRef.current;
  const stickExcluded = claimStickBytes(side, y ? [x.idx, y.idx] : [x.idx], refs);

  cb.setGyroExcluded(new Set(refs.excludedRef.current));
  cb.addLog(`  ${label} stick claimed byte(s): [${stickExcluded.join(', ')}]`);

  cb.setItems(prev => prev.map(it => {
    if (it.id === xId) return { ...it, status: 'captured', result: xAxis.result, axisMapping: xAxis.mapping };
    if (it.id === yId) return { ...it, status: yAxis ? 'captured' : 'skipped', result: yResult, axisMapping: yAxis?.mapping };
    return it;
  }));

  cb.setActiveStick(null);
  refs.activeStickRef.current = null;
  cb.setStickBusy(false);
  cb.setStickLiveInfo('');
  cb.addLog(`${label} stick calibration done, wrote ${xId}=captured, ${yId}=${yAxis ? 'captured' : 'skipped'}.`);
  cb.updateByteStatuses(mins.length);
};

export { finalizeStickCalibration };
