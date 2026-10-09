/* @layer renderer-components @kind hook */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { buildDeviceProfile, buildDeviceProfileFromSdlType } from '@shared/input';
import type { DeviceProfile } from '@shared/input';
import { buildDisplayContext, resolveBrandLogoKey, resolveDeviceName } from '@shared/input/family';
import type { SdlGamepadType } from '@shared/input/family';
import { SDL_GAMEPAD_TYPES } from '@rotp/game-data';
import type { DeviceEntry } from '@drizztdourden08/brock-input';
import type { DeviceFamily } from '@rotp/game-data';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';
import { listInputDevices } from './list-input-devices';

const toHex4 = (n: number): string => n.toString(16).padStart(4, '0');

const familyFor = (sdlType: SdlGamepadType): DeviceFamily =>
  (resolveBrandLogoKey(buildDisplayContext({ sdlType })) || 'generic') as DeviceFamily;

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

const profileFromSdlType = (sdlType: SdlGamepadType): DeviceProfile => {
  const name = resolveDeviceName(buildDisplayContext({ sdlType }), sdlType);
  return buildDeviceProfileFromSdlType({ id: sdlType, name, family: familyFor(sdlType), inputApi: 'hid' }, sdlType);
};

const useDeviceAutoDetect = (addLog: (msg: string) => void, initialProfileId?: string, initialHasGyro?: boolean, deviceKey?: string, initialProfile?: DeviceProfile | null) => {
  const [selectedProfileId, setSelectedProfileId] = useState(initialProfileId ?? '');
  const [selectedSdlVidPid, setSelectedSdlVidPid] = useState('');
  const [hasGyro, setHasGyro] = useState(initialHasGyro ?? true);
  const [detectedProfile, setDetectedProfile] = useState<DeviceProfile | null>(null);

  useEffect(() => {
    if (!initialProfile) return;
    setDetectedProfile(initialProfile);
    setSelectedProfileId(initialProfile.id);
  }, [initialProfile]);

  useEffect(() => {
    if (initialProfile || !initialProfileId) return;
    if (!deviceKey) {
      setDetectedProfile(profileFromSdlType(initialProfileId as SdlGamepadType));
      return;
    }
    listInputDevices().then((entries) => {
      const entry = entries.find((e) => e.deviceKey === deviceKey);
      setDetectedProfile(entry?.hasButton?.length
        ? profileFromEntry(entry)
        : profileFromSdlType(initialProfileId as SdlGamepadType));
    }).catch(() => setDetectedProfile(profileFromSdlType(initialProfileId as SdlGamepadType)));
  }, [initialProfile, initialProfileId, deviceKey]);

  useEffect(() => {
    if (initialProfile || initialProfileId) return;
    listInputDevices().then((entries) => {
      const entry = entries.find((e) => e.status === 'ready');
      if (!entry) return;
      const vidPid = entry.deviceKey;
      if (!entry.sdlType) {
        addLog(`No SDL type known yet for ${vidPid}. Pick manually or use Generic`);
        return;
      }
      setSelectedSdlVidPid(vidPid);
      setHasGyro(entry.hasGyro ?? false);
      const profile = profileFromEntry(entry);
      setSelectedProfileId(profile.id);
      setDetectedProfile(profile);
      addLog(`SDL match: ${profile.name} (${vidPid})${entry.hasGyro ? ' [gyro]' : ''} with ${profile.buttons.length} buttons, ${profile.axes.length} axes`);
    }).catch(() => { addLog('Failed to read live device capabilities'); });
  }, [addLog, initialProfile, initialProfileId]);

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
