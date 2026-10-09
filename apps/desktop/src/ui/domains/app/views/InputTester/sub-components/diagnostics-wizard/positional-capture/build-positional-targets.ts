/* @layer renderer-components @kind logic */
import { SDL_BUTTON } from '@rotp/game-data';
import type { ResolvedDevice, SdlButtonName } from '@shared/input/family';
import type { PositionalTarget } from './positional-capture.type';

const buildPositionalTargets = (resolvedDevice: ResolvedDevice | null): PositionalTarget[] => {
  if (!resolvedDevice) return [];

  return resolvedDevice.controls.map((control) => ({
    id: control.position,
    kind: control.kind,
    label: control.label,
    category: control.category,
    expectedIndex: control.kind === 'button' ? SDL_BUTTON[control.position as SdlButtonName] : null,
  }));
};

export { buildPositionalTargets };
