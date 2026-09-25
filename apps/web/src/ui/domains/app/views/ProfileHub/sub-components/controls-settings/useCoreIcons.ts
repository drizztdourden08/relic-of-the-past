/* @layer renderer-components @kind hook */
/**
 * useCoreIcons resolves the device glyph for each of the ten core verbs.
 *
 * The SNES mapping rows have carried a resolved icon since the family layer
 * landed (useDisplayMappings); the core-verb rows never did, and passing no
 * icon is not neutral. `getBindingIconUrl` ends its chain on a generic keyed
 * off the binding's SHAPE alone, so on a pad every core button row drew the
 * same generic_button.svg. Pause, Map, Confirm, Cancel and the two screen
 * verbs were six identical circles, one tab away from the same physical buttons
 * drawn as real artwork.
 *
 * So this resolves through the SAME function that tab does,
 * `resolveIconByVidPid`, which is the family layer's answer for "what does
 * this vid:pid call the control at this binding index". It tries device override,
 * then family, then generic, plus `resolveStickDirectionIcon` for an axis so
 * the four movement rows get four different glyphs instead of four neutral
 * sticks.
 *
 * A core binding carries no source vid:pid of its own the way a ButtonMapping
 * does, so the profile's ASSIGNED device supplies it. That is the same device
 * `controlsForProfile` prefills the slot list from, so the two lists on this tab
 * cannot disagree about which pad they are describing.
 *
 * Keyboard and unbound verbs resolve to null on purpose: a keyboard binding's
 * glyph comes from its own key code further down `getBindingIconUrl`'s chain,
 * and `none` draws nothing at all.
 */
import { useMemo } from 'react';
import { resolveIconByVidPid } from '@app/lib/input/profile-utils';
import { findLiveDevice } from './live-device';
import { padHex } from './controls-settings.type';
import type { CoreVerb } from '@shared/input/scheme';
import type { ButtonIcon, CoreBindings, DetectedDevice, InputProfile } from '@shared/types/controls';

type CoreIcons = Partial<Record<CoreVerb, ButtonIcon | null>>;

interface UseCoreIconsArgs {
  activeProfile: InputProfile | null;
  devices: DetectedDevice[];
  core: CoreBindings;
}

const useCoreIcons = ({ activeProfile, devices, core }: UseCoreIconsArgs): CoreIcons => {
  return useMemo(() => {
    const assigned = activeProfile?.assignedDevice;
    if (!assigned?.vendorId || !assigned.productId) return {};

    const vid = padHex(assigned.vendorId);
    const pid = padHex(assigned.productId);
    const liveSdlType = findLiveDevice(vid, pid, devices)?.sdlType;

    const icons: CoreIcons = {};
    for (const [verb, binding] of Object.entries(core) as [CoreVerb, CoreBindings[CoreVerb]][]) {
      if (binding.type === 'none' || binding.type === 'keyboard') continue;
      icons[verb] = resolveIconByVidPid(vid, pid, binding, liveSdlType);
    }
    return icons;
  }, [activeProfile, devices, core]);
};

export { useCoreIcons };
export type { CoreIcons };
