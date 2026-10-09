/* @layer renderer-lib @kind logic */
import * as controllersStore from '../controllers-store';
import { controllerInputStore } from '../controller-input-store';
import type { DeviceStickCalibration } from '../controller-input-store';

const loadCalibrations = (): void => {
  controllersStore.readStickCalibration()
    .then((store) => {
      controllerInputStore.loadStickCalibrations(store as Record<string, DeviceStickCalibration>);
    })
    .catch((e: unknown) => console.warn('[input] failed to load stick calibration', e));
  controllersStore.readTriggerCalibration()
    .then((store) => {
      controllerInputStore.loadTriggerCalibrations(store);
    })
    .catch((e: unknown) => console.warn('[input] failed to load trigger calibration', e));
};

export { loadCalibrations };
