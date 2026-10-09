/* @layer renderer-lib @kind logic */
import type { DeviceEnvironment } from '../diagnostics.type';
import type { DebugSection } from './section.type';
import { section } from './section';
import { mib, orDash, yesNo } from './units';

const processSection = (device: DeviceEnvironment): DebugSection => section('Renderer process', [
  `Logical cores seen by the renderer: ${orDash(device.logicalCores)}`,
  device.deviceMemoryGb !== null && `Reported device memory: ${device.deviceMemoryGb} GB`,
  device.jsHeap
    && `JS heap: ${mib(device.jsHeap.usedBytes)} used / ${mib(device.jsHeap.totalBytes)} allocated`
      + ` (limit ${mib(device.jsHeap.limitBytes)})`,
  `Languages: ${device.languages.join(', ') || '-'} · time zone ${orDash(device.timeZone)}`,
  `Online: ${yesNo(device.online)}`,
]);

export { processSection };
