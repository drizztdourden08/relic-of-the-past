/* @layer shared-features @kind logic */
import type { GameSettings } from '../settings';
import { isDeluxeMode } from './is-deluxe-mode';
import type { MsuPackProfile } from './msu-auto-config.type';
import { resolveAudioConfig } from './resolve-audio-config';

const resolveMsuPlayback = (settings: GameSettings, pack: MsuPackProfile | null) => {
  const resolved = resolveAudioConfig(settings, pack);
  return {
    enabled: !settings.vanillaSafe && Boolean(pack) && resolved.enableMSU !== 'false',
    isDeluxe: pack?.isDeluxe ?? isDeluxeMode(resolved.enableMSU),
    resolved,
  };
};

export { resolveMsuPlayback };
