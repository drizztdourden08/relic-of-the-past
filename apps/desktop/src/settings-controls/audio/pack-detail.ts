/* @layer renderer-components @kind logic */
import type { MsuPackProfile, ResolvedAudioConfig } from '@rotp/features';

const packDetail = (pack: MsuPackProfile, resolved: ResolvedAudioConfig): string => {
  const parts: string[] = [];
  if (pack.isLayered) {
    parts.push('layered');
    if (pack.isDeluxe) parts.push('extended slots');
  }
  parts.push(`${resolved.audioFreq} Hz`);
  parts.push(resolved.audioChannels === 1 ? 'Mono' : 'Stereo');
  return parts.join(' · ');
};

export { packDetail };
