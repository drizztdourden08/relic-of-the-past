/* @layer renderer-components @kind logic */
import { inputApi } from '@drizztdourden08/brock-input/renderer';
import type { DeviceEntry } from '@drizztdourden08/brock-input';

const listInputDevices = (): Promise<DeviceEntry[]> => inputApi()?.list() ?? Promise.resolve([]);

export { listInputDevices };
