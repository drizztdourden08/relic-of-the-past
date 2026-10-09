/* @layer shared-game @kind logic */
import type { TargetCompat } from '../save-state.type';

const describeTargetCompat = (compat: TargetCompat, currentVersion: string): string | null => {
  if (compat.kind === 'compatible') return null;
  const goBack = `Nothing is deleted either way. Reinstalling ${currentVersion} always gets them back.`;

  if (compat.kind === 'incompatible') {
    return `This version uses a different save state format, so your existing save states will not load. ${goBack} Your in-game saves are not affected.`;
  }
  return `This version did not publish its save state format, so there is a chance your save states will not load. ${goBack}`;
};

export { describeTargetCompat };
