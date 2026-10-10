/* @layer renderer-components @kind logic */
import { CONFIRM_FRAMES } from '../hid-calibration.constants';
import { findAxisBytes } from '../hid-analysis';
import { AXIS_PRESS_DELTA } from './button-detection.constants';
import type { AxisStepArgs } from './button-detection.type';

const startPress = ({ bytes, bl, excl, refs, cb }: AxisStepArgs): void => {
  refs.releaseCountRef.current = 0;
  refs.confirmCountRef.current = 0;
  refs.detectedBtnRef.current = null;
  const diffs = findAxisBytes(bl, bytes, excl, AXIS_PRESS_DELTA);
  const [first] = diffs;
  if (first) {
    refs.detectedBtnRef.current = { byteIndex: first.byteIndex, bitMask: 0 };
    refs.confirmCountRef.current = 1;
    cb.setCaptureState('confirming-press');
  }
};

const confirmPress = ({ bytes, bl, excl, item, refs, cb }: AxisStepArgs): void => {
  const diffs = findAxisBytes(bl, bytes, excl, AXIS_PRESS_DELTA);
  if (diffs.length === 0) {
    refs.confirmCountRef.current = 0;
    refs.detectedBtnRef.current = null;
    cb.setCaptureState('waiting-press');
    return;
  }
  refs.confirmCountRef.current++;
  if (refs.confirmCountRef.current < CONFIRM_FRAMES) return;
  const axisId = item.id;
  if (!refs.axisCapRef.current[axisId]) refs.axisCapRef.current[axisId] = { posBytes: null, negBytes: null };
  const changes = diffs.map(d => `[${d.byteIndex}]:${d.baseVal}→${d.sampleVal}`).join(', ');
  if (refs.axisSubStepRef.current === 'pos') {
    refs.axisCapRef.current[axisId].posBytes = new Uint8Array(bytes);
    cb.addLog(`✓ ${item.label}+ on ${changes}`);
  } else {
    refs.axisCapRef.current[axisId].negBytes = new Uint8Array(bytes);
    cb.addLog(`✓ ${item.label}− on ${changes}`);
  }
  cb.setCaptureState('waiting-release');
};

const processAxisPress = (args: AxisStepArgs): void => {
  const state = args.refs.captureStateRef.current;
  if (state === 'waiting-press') startPress(args);
  else if (state === 'confirming-press') confirmPress(args);
};

export { processAxisPress };
