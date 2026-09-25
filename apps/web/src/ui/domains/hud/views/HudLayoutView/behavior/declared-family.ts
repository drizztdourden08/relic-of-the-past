/* @layer renderer-hud @kind logic */
/**
 * The active input profile's OWN declared family. It is the backstop under
 * `deviceFamilyOf`, for the case where no slot's icon is family-stamped.
 *
 * A generic or unrecognised pad names its controls with family-less icon keys
 * ('generic-btn'), so the slot list has nothing to say about the hardware and
 * the cluster would fall to the generic pack. The profile has known the answer
 * all along, because it is written there when the device is assigned, so it is
 * read here instead of guessed at.
 *
 * `peekInputManager`, never `getInputManager`: this is called from a render
 * path, and the getter CONSTRUCTS and STARTS the engine as a side effect. A
 * HUD that draws before the engine exists must get null, not bring it up.
 *
 * Reading instead of subscribing is deliberate and safe. Both readers call
 * this inside a memo keyed on the resolved bindings, and the engine rebuilds
 * and rebroadcasts those on every profile change and every device snapshot
 * (`rebuildSchemeBindings`), so the value is re-read exactly when the profile
 * it comes from can have moved.
 */
import { peekInputManager } from '@app/lib/input/input-manager';
import type { DeviceFamily } from '@shared/types/controls';

const declaredDeviceFamily = (): DeviceFamily | null =>
  peekInputManager()?.getProfile()?.deviceFamily ?? null;

export { declaredDeviceFamily };
