/* @layer renderer-components @kind hook */
/**
 * Auto-detects the connected controller's SDL type and builds the
 * DeviceProfile checklist the wizard calibrates against, straight from SDL's
 * own live capability report (hasButton/hasAxis/buttonLabels) — no per-model
 * database is consulted any more. The manual override list is the small,
 * finite set of SDL gamepad families rather than a list of named models,
 * since that is genuinely everything left to choose between.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { listControllerDevices } from '../../../../../../../../lib/input/controller-devices-store';
import { buildDeviceProfile, buildDeviceProfileFromSdlType } from '@shared/input';
import type { DeviceProfile } from '@shared/input';
import { buildDisplayContext, resolveBrandLogoKey, resolveDeviceName } from '@shared/input/family';
import type { SdlGamepadType } from '@shared/input/family';
import { SDL_GAMEPAD_TYPES } from '@shared/input/sdl-buttons';
import type { DeviceEntry } from '@shared/ipc';
import type { DeviceFamily } from '@shared/types/controls';
import type { SelectOption } from '../../../../../../../design-system/primitives';

const toHex4 = (n: number): string => n.toString(16).padStart(4, '0');

const familyFor = (sdlType: SdlGamepadType): DeviceFamily =>
  (resolveBrandLogoKey(buildDisplayContext({ sdlType })) || 'generic') as DeviceFamily;

/** Builds a DeviceProfile from a live entry's own hasButton/hasAxis — only
 *  positions this specific unit actually reports appear. */
const profileFromEntry = (entry: DeviceEntry): DeviceProfile => {
  const sdlType = (entry.sdlType ?? 'unknown') as SdlGamepadType;
  const vendorId = toHex4(entry.vendorId);
  const productId = toHex4(entry.productId);
  const ctx = buildDisplayContext({ sdlType, vendorId, productId });
  const name = resolveDeviceName(ctx, entry.name || entry.product || sdlType);
  return buildDeviceProfile(
    { id: sdlType, name, family: familyFor(sdlType), inputApi: 'hid', vendorId, productId },
    { sdlType, hasButton: entry.hasButton ?? [], hasAxis: entry.hasAxis ?? [], buttonLabels: entry.buttonLabels },
  );
};

/** Builds a synthetic "assume everything the family recognizes" DeviceProfile
 *  for a manually-picked family, since there is no live unit to ask. */
const profileFromSdlType = (sdlType: SdlGamepadType): DeviceProfile => {
  const name = resolveDeviceName(buildDisplayContext({ sdlType }), sdlType);
  return buildDeviceProfileFromSdlType({ id: sdlType, name, family: familyFor(sdlType), inputApi: 'hid' }, sdlType);
};

/**
 * `initialProfileId`/`initialHasGyro`, when given, are a host's own already-
 * resolved device+profile id (see HidCalibrationWizardProps.initialProfileId
 * — the diagnostics wizard passes its own live-resolved sdlType here).
 * `deviceKey` lets this hook still build the precise, live-capability
 * DeviceProfile in that case instead of falling back to the synthetic
 * "assume everything" one; auto-detect from the connected key list only
 * runs when no host has already resolved a device at all.
 */
const useDeviceAutoDetect = (addLog: (msg: string) => void, initialProfileId?: string, initialHasGyro?: boolean, deviceKey?: string, initialProfile?: DeviceProfile | null) => {
  const [selectedProfileId, setSelectedProfileId] = useState(initialProfileId ?? '');
  const [selectedSdlVidPid, setSelectedSdlVidPid] = useState('');
  const [hasGyro, setHasGyro] = useState(initialHasGyro ?? true);
  const [detectedProfile, setDetectedProfile] = useState<DeviceProfile | null>(null);

  // ── A host that already read the device's layout hands it straight over ──
  // Nothing to re-derive and nothing that could be re-derived anyway: by now
  // the device is released and reports no capabilities at all.
  useEffect(() => {
    if (!initialProfile) return;
    setDetectedProfile(initialProfile);
    setSelectedProfileId(initialProfile.id);
  }, [initialProfile]);

  // ── A host that resolved only an id (no layout handed over) ──
  useEffect(() => {
    if (initialProfile || !initialProfileId) return;
    if (!deviceKey) {
      setDetectedProfile(profileFromSdlType(initialProfileId as SdlGamepadType));
      return;
    }
    listControllerDevices().then((entries) => {
      const entry = entries.find((e) => e.deviceKey === deviceKey);
      // Only a claimed device reports what it can do. A host that hands over a
      // layout it read itself (initialProfile above) is the supported way to
      // ask about a released one; the family's full set is all that is left
      // for a device SDL never opened at all.
      setDetectedProfile(entry?.hasButton?.length
        ? profileFromEntry(entry)
        : profileFromSdlType(initialProfileId as SdlGamepadType));
    }).catch(() => setDetectedProfile(profileFromSdlType(initialProfileId as SdlGamepadType)));
  }, [initialProfile, initialProfileId, deviceKey]);

  // ── Auto-detect from the live connected device (no host resolved one) ──
  // Reads the live snapshot directly, so a device that is connected but hasn't
  // sent a single report yet (SDL emits state on change only) still auto-detects.
  useEffect(() => {
    if (initialProfile || initialProfileId) return;
    listControllerDevices().then((entries) => {
      const entry = entries.find((e) => e.status === 'ready');
      if (!entry) return;
      const vidPid = entry.deviceKey;
      if (!entry.sdlType) {
        addLog(`No SDL type known yet for ${vidPid} — pick manually or use Generic`);
        return;
      }
      setSelectedSdlVidPid(vidPid);
      setHasGyro(entry.hasGyro ?? false);
      const profile = profileFromEntry(entry);
      setSelectedProfileId(profile.id);
      setDetectedProfile(profile);
      addLog(`SDL match: ${profile.name} (${vidPid})${entry.hasGyro ? ' [gyro]' : ''} — ${profile.buttons.length} buttons, ${profile.axes.length} axes`);
    }).catch(() => { addLog('Failed to read live device capabilities'); });
  }, [addLog, initialProfile, initialProfileId]);

  // ── Manual family override ──
  const sdlOptions: SelectOption[] = useMemo(
    () => SDL_GAMEPAD_TYPES.map((t) => ({ value: t, label: t })),
    [],
  );
  const handleSdlSelect = useCallback((sdlType: string) => {
    setSelectedSdlVidPid(sdlType);
    if (!sdlType) { setSelectedProfileId(''); setDetectedProfile(null); return; }
    const profile = profileFromSdlType(sdlType as SdlGamepadType);
    setSelectedProfileId(profile.id);
    setDetectedProfile(profile);
  }, []);

  return { selectedProfileId, selectedSdlVidPid, hasGyro, sdlOptions, handleSdlSelect, detectedProfile };
};

export { useDeviceAutoDetect };
