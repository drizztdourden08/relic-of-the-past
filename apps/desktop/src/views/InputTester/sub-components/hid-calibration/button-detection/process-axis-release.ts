/* @layer renderer-components @kind logic */
import type { HidAxisMapping } from '../hid-calibration.type';
import { findAxisBytes } from '../hid-analysis';
import { AXIS_FINAL_DELTA, AXIS_RELEASE_DELTA, AXIS_RELEASE_FRAMES } from './button-detection.constants';
import { scheduleAdvance } from './schedule-advance';
import { pickWidestAxisByte } from './pick-widest-axis-byte';
import type { AxisStepArgs } from './button-detection.type';

const finalizeAxisCapture = ({ bytes, bl, excl, item, idx, refs, cb }: AxisStepArgs): void => {
  const ac = refs.axisCapRef.current[item.id];
  if (ac?.posBytes && ac?.negBytes) {
    const posD = findAxisBytes(bl, ac.posBytes, excl, AXIS_FINAL_DELTA);
    const negD = findAxisBytes(bl, ac.negBytes, excl, AXIS_FINAL_DELTA);
    const allB = new Set([...posD.map(d => d.byteIndex), ...negD.map(d => d.byteIndex)]);
    const best = pickWidestAxisByte(allB, ac.posBytes, ac.negBytes);
    if (best) {
      const { byte: bestByte, pos: posVal, neg: negVal } = best;
      const centerVal = bl[bestByte];
      if (centerVal === undefined) throw new Error(`baseline has no byte ${String(bestByte)}`);
      const inverted = posVal < negVal;
      const axisMapping: HidAxisMapping = { byteIndex: bestByte, center: centerVal, min: Math.min(posVal, negVal), max: Math.max(posVal, negVal), inverted };
      const result = `byte[${bestByte}] ${axisMapping.min}..${centerVal}..${axisMapping.max}${inverted ? ' inv' : ''}`;
      cb.addLog(`OK ${item.label}: ${result}`);
      cb.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'captured' as const, result, axisMapping } : it));
      cb.updateByteStatuses(bytes.length);
    } else {
      cb.addLog(`Warning: No axis data for ${item.label}`);
      cb.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'skipped' as const, result: 'no data' } : it));
    }
  }
  if (refs.autoAdvanceRef.current) scheduleAdvance(refs, cb);
  else cb.setCaptureState('waiting-press');
};

const processAxisRelease = (args: AxisStepArgs): void => {
  const { bytes, bl, excl, refs, cb } = args;
  const released = findAxisBytes(bl, bytes, excl, AXIS_RELEASE_DELTA).length === 0;
  if (!released) { refs.releaseCountRef.current = 0; return; }
  refs.releaseCountRef.current++;
  if (refs.releaseCountRef.current < AXIS_RELEASE_FRAMES) return;

  if (refs.axisSubStepRef.current === 'pos') {
    cb.setAxisSubStep('neg');
    cb.setCaptureState('waiting-press');
    refs.releaseCountRef.current = 0;
  } else {
    finalizeAxisCapture(args);
  }
};

export { processAxisRelease };
