/* @layer renderer-components @kind logic */
import type { ButtonDiff } from '../hid-calibration.type';
import { popcount } from './popcount';

const swing = (d: ButtonDiff): number => Math.abs(d.pressedValue - d.restValue);

const pickBestButtonDiff = (diffs: ButtonDiff[]): ButtonDiff => {
  const digital = diffs.filter(d => !d.analog);
  const analog = diffs.filter(d => d.analog);
  const [firstDigital] = digital;
  if (firstDigital) {
    return digital.reduce((best, d) => (popcount(d.bitMask) < popcount(best.bitMask) ? d : best), firstDigital);
  }
  const [firstAnalog] = analog;
  if (!firstAnalog) throw new Error('no button diff to pick from');
  return analog.reduce((best, d) => (swing(d) > swing(best) ? d : best), firstAnalog);
};

export { pickBestButtonDiff };
