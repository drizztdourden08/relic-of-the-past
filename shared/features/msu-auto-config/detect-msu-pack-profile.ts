/* @layer shared-features @kind logic */
import { DELUXE_TRACK_THRESHOLD } from '@rotp/hub-contracts';
import type { MsuPackProfile, MsuTrackInfo } from './msu-auto-config.type';

const detectMsuPackProfile = (tracks: MsuTrackInfo[], isLayered = false): MsuPackProfile => ({
  isDeluxe: tracks.some((t) => t.trackNum >= DELUXE_TRACK_THRESHOLD),
  hasOpuz: tracks.some((t) => t.ext === 'opuz'),
  isLayered,
});

export { detectMsuPackProfile };
