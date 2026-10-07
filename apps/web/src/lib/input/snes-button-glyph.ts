/* @layer renderer-lib @kind logic */
/**
 * The picture and name of whatever physical input a SNES button is bound to in an input profile. A
 * profile holds one binding per SNES button, so the answer is the key or the controller button the
 * player set up: a keyboard profile gives keycaps, a controller profile that controller's own face
 * buttons. Resolved the way the Controls screen resolves its binding rows. An unbound button falls back
 * to the SNES button's own picture.
 */
import type { DetectedDevice, InputProfile, SnesButton } from '@shared/types/controls';
import { getBindingIconUrl, getBindingLabel } from './binding-display';
import { getSnesIconUrl } from './button-icons';
import { padHex } from './profile-devices';
import { resolveIconByVidPid } from './profile-utils';

interface ButtonGlyph {
  /** Image URL, or null to show the label as a keycap. */
  src: string | null;
  label: string;
}

const liveSdlType = (vid: string, pid: string, devices: DetectedDevice[]): string | null =>
  devices.find((d) => d.type === 'gamepad' && d.connected && d.vendorId && d.productId
    && padHex(d.vendorId) === vid && padHex(d.productId) === pid)?.sdlType ?? null;

const snesButtonGlyph = (profile: InputProfile | null, snes: SnesButton, devices: DetectedDevice[]): ButtonGlyph => {
  const mapping = profile?.mappings.find((m) => m.snesButton === snes);
  const binding = mapping?.binding;
  if (!mapping || !binding || binding.type === 'none') return { src: getSnesIconUrl(snes), label: snes };
  if (binding.type === 'keyboard') return { src: getBindingIconUrl(binding), label: getBindingLabel(binding) };
  const vid = mapping.sourceVid ? padHex(mapping.sourceVid) : null;
  const pid = mapping.sourcePid ? padHex(mapping.sourcePid) : null;
  const icon = vid && pid ? resolveIconByVidPid(vid, pid, binding, liveSdlType(vid, pid, devices)) : mapping.icon;
  return { src: getBindingIconUrl(binding, icon), label: getBindingLabel(binding, icon) };
};

export { snesButtonGlyph };
export type { ButtonGlyph };
