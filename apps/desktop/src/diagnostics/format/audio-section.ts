/* @layer renderer-lib @kind logic */
import type { AudioDiagnostics } from '../diagnostics.type';
import type { DebugSection } from './section.type';
import { section } from './section';
import { ms } from './units';

const audioSection = (audio: AudioDiagnostics | null): DebugSection => section('Audio', [
  audio
    ? `Output: ${audio.sampleRate} Hz · ${audio.maxChannels} channels · state ${audio.state}`
    : 'Output: unavailable (no audio context)',
  audio && `Latency: base ${ms(audio.baseLatencyMs)} · output ${ms(audio.outputLatencyMs)}`,
]);

export { audioSection };
