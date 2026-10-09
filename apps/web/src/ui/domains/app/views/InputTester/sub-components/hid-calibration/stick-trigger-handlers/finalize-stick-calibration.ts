/* @layer renderer-components @kind logic */
import type { HidAxisMapping, InputStatus, StickCandidate } from '../hid-calibration.type';
import type { StickFinalizeCallbacks, StickFinalizeRefs } from './stick-trigger-handlers.type';

const finalizeStickCalibration = (c1: StickCandidate, c2: StickCandidate | null, refs: StickFinalizeRefs, cb: StickFinalizeCallbacks): void => {
  const side = refs.activeStickRef.current ?? 'left';
  const label = side === 'left' ? 'LEFT' : 'RIGHT';
  const xId = side === 'left' ? 'leftX' : 'rightX';
  const yId = side === 'left' ? 'leftY' : 'rightY';

  const x = c2 ? (c1.idx < c2.idx ? c1 : c2) : c1;
  const y = c2 ? (c1.idx < c2.idx ? c2 : c1) : null;

  const xMapping: HidAxisMapping = { byteIndex: x.idx, center: x.center, min: x.min, max: x.max, inverted: false };
  const xResult = `byte[${x.idx}] ${x.min}..${x.center}..${x.max} (range ${x.range})`;
  cb.addLog(`✓ ${label} X: ${xResult}`);

  let yMapping: HidAxisMapping | null = null;
  let yResult = 'skipped (single byte)';
  if (y) {
    yMapping = { byteIndex: y.idx, center: y.center, min: y.min, max: y.max, inverted: false };
    yResult = `byte[${y.idx}] ${y.min}..${y.center}..${y.max} (range ${y.range})`;
    cb.addLog(`✓ ${label} Y: ${yResult}`);
  } else {
    cb.addLog(`  ${label} Y: skipped (single byte stick)`);
  }

  const mins = refs.stickMinsRef.current;
  const sideBytes = side === 'left' ? refs.leftStickBytesRef : refs.rightStickBytesRef;
  sideBytes.current = new Set();
  const stickExcluded: number[] = [];

  const explicitBytes = new Set<number>();
  explicitBytes.add(x.idx);
  if (y) explicitBytes.add(y.idx);
  for (const bi of explicitBytes) {
    refs.excludedRef.current.add(bi);
    refs.capturedStickBytesRef.current.add(bi);
    sideBytes.current.add(bi);
    stickExcluded.push(bi);
  }

  cb.setGyroExcluded(new Set(refs.excludedRef.current));
  cb.addLog(`  ${label} stick claimed byte(s): [${stickExcluded.join(', ')}]`);

  cb.setItems(prev => prev.map(it => {
    if (it.id === xId) return { ...it, status: 'captured' as InputStatus, result: xResult, axisMapping: xMapping };
    if (it.id === yId) return { ...it, status: (yMapping ? 'captured' : 'skipped') as InputStatus, result: yResult, axisMapping: yMapping ?? undefined };
    return it;
  }));

  cb.setActiveStick(null);
  refs.activeStickRef.current = null;
  cb.setStickBusy(false);
  cb.setStickLiveInfo('');
  cb.addLog(`${label} stick calibration done, wrote ${xId}=captured, ${yId}=${yMapping ? 'captured' : 'skipped'}.`);
  cb.updateByteStatuses(mins.length);
};

export { finalizeStickCalibration };
