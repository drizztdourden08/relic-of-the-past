/* @layer renderer-lib @kind logic */
/** Audio output, connected controllers, and the renderer's own view of the machine
 *  (which is all there is to report on the web and mobile builds). */
import type { AudioDiagnostics, DeviceEnvironment } from '../types';
import type { DebugSection } from './section';
import { section } from './section';
import { mib, ms, orDash, yesNo } from './units';

const audioSection = (audio: AudioDiagnostics | null): DebugSection => section('Audio', [
  audio
    ? `Output: ${audio.sampleRate} Hz · ${audio.maxChannels} channels · state ${audio.state}`
    : 'Output: unavailable (no audio context)',
  audio && `Latency: base ${ms(audio.baseLatencyMs)} · output ${ms(audio.outputLatencyMs)}`,
]);

const inputSection = ({ gamepads, maxTouchPoints }: DeviceEnvironment): DebugSection => section('Input', [
  `Gamepads visible to the browser: ${gamepads.length}`,
  ...gamepads.map((pad, index) => `   ${index + 1}. ${pad}`),
  `Max touch points: ${maxTouchPoints}`,
]);

const processSection = (device: DeviceEnvironment): DebugSection => section('Renderer process', [
  `Logical cores seen by the renderer: ${orDash(device.logicalCores)}`,
  device.deviceMemoryGb !== null && `Reported device memory: ${device.deviceMemoryGb} GB`,
  device.jsHeap
    && `JS heap: ${mib(device.jsHeap.usedBytes)} used / ${mib(device.jsHeap.totalBytes)} allocated`
      + ` (limit ${mib(device.jsHeap.limitBytes)})`,
  `Languages: ${device.languages.join(', ') || '—'} · time zone ${orDash(device.timeZone)}`,
  `Online: ${yesNo(device.online)}`,
]);

export { audioSection, inputSection, processSection };
