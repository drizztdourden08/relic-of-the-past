/* @layer renderer-lib @kind logic */
import { rebuildSchemeBindings, allowedDevices, deviceKeyFor, setScoped } from '@rotp/input-mapping';
import type { InputManager } from './input-manager';

const rebuildMaps = (m: InputManager): void => {
  m.keyboardMap.clear();
  m.gamepadButtonMap.clear();
  m.gamepadAxisMap.clear();
  m.allowed = allowedDevices(m.activeProfile);
  rebuildSchemeBindings(m.activeProfile, m.hidDeviceCache);
  if (!m.activeProfile) return;
  for (const mapping of m.activeProfile.mappings) {
    const b = mapping.binding;
    switch (b.type) {
      case 'keyboard':
        m.keyboardMap.set(b.code, mapping.snesButton);
        break;
      case 'gamepad-button':
        setScoped(m.gamepadButtonMap, deviceKeyFor(mapping.sourceVid, mapping.sourcePid), b.index, mapping.snesButton);
        break;
      case 'gamepad-axis':
        setScoped(m.gamepadAxisMap, deviceKeyFor(mapping.sourceVid, mapping.sourcePid), `${b.axisIndex}:${b.direction}`, mapping.snesButton);
        break;
    }
  }
};

export { rebuildMaps };
