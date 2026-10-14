/* @layer renderer-lib @kind logic */
import type { DetectedDevice, InputProfile, ButtonGlyph } from '@rotp/input-mapping';
import type { SnesButton } from '@rotp/game-data';
import { getBindingIconUrl } from '@app/input/binding-display/get-binding-icon-url';
import { getBindingLabel, padHex, resolveIconByVidPid } from '@rotp/input-mapping';
import { getSnesIconUrl } from '@app/input/button-icons/get-snes-icon-url';
import type { ProfileMapping } from './snes-button-glyph.type';

const liveSdlType = (vid: string, pid: string, devices: DetectedDevice[]): string | null =>
  devices.find((d) => d.type === 'gamepad' && d.connected && d.vendorId && d.productId
    && padHex(d.vendorId) === vid && padHex(d.productId) === pid)?.sdlType ?? null;

const mappingIcon = (mapping: ProfileMapping, binding: ProfileMapping['binding'], devices: DetectedDevice[]): ProfileMapping['icon'] => {
  const vid = mapping.sourceVid ? padHex(mapping.sourceVid) : null;
  const pid = mapping.sourcePid ? padHex(mapping.sourcePid) : null;
  return vid && pid ? resolveIconByVidPid(vid, pid, binding, liveSdlType(vid, pid, devices)) : mapping.icon;
};

const snesButtonGlyph = (profile: InputProfile | null, snes: SnesButton, devices: DetectedDevice[]): ButtonGlyph => {
  const mapping = profile?.mappings.find((m) => m.snesButton === snes);
  const binding = mapping?.binding;
  if (!mapping || !binding || binding.type === 'none') return { src: getSnesIconUrl(snes), label: snes };
  if (binding.type === 'keyboard') return { src: getBindingIconUrl(binding), label: getBindingLabel(binding) };
  const icon = mappingIcon(mapping, binding, devices);
  return { src: getBindingIconUrl(binding, icon), label: getBindingLabel(binding, icon) };
};

export { snesButtonGlyph };
export type { ButtonGlyph };
