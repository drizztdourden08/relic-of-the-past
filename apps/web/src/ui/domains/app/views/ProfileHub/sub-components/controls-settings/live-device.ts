/* @layer renderer-components @kind logic */
/**
 * "Is the pad this binding came from plugged in right now?" for the controls
 * screen.
 *
 * Shared instead of duplicated because two lenses ask it for the same reason:
 * a live device carries an `sdlType`, and that is what lets `resolveIconByVidPid`
 * answer for a pad this session's family cache has never seen. Both the SNES
 * mapping rows and the core-verb rows resolve their glyph that way, so both
 * need the same lookup, keyed the same way.
 */
import { padHex } from './controls-settings.type';
import type { DetectedDevice } from '@shared/types/controls';

/** The live device (if any) currently plugged in at this vid:pid. */
const findLiveDevice = (vid: string, pid: string, devices: readonly DetectedDevice[]): DetectedDevice | undefined =>
  devices.find(d =>
    d.type === 'gamepad' && d.connected &&
    d.vendorId && d.productId &&
    padHex(d.vendorId) === vid && padHex(d.productId) === pid
  );

export { findLiveDevice };
