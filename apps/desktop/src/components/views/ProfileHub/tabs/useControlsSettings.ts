/**
 * useControlsSettings — all state, CRUD, binding, and drag-drop logic
 * extracted from ControlsSettings for manageable file sizes.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type {
  InputProfile,
  DetectedDevice,
  InputBinding,
  SnesButton,
  FunctionAction,
  FunctionMapping,
} from '@shared/types/controls';
import {
  SNES_BUTTONS,
  SNES_BUTTON_LABELS,
  DEFAULT_FUNCTION_MAPPINGS,
} from '@shared/types/controls';
import { findPresetById, KEYBOARD_DEFAULT } from '@shared/input';
import { findDeviceProfileByVidPid } from '@shared/input';
import { getInputManager, profileFromPreset, resolveFunctionMappingIcon } from '../../../../lib/input/input-manager';

/** Pad a hex VID/PID to 4 chars lowercase, e.g. "57e" → "057e" */
function padHex(v: string): string {
  return v.toLowerCase().padStart(4, '0');
}

interface UseControlsSettingsArgs {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profileId: string;
}

function useControlsSettings({ settings, onChange, profileId }: UseControlsSettingsArgs) {
  const [profiles, setProfiles] = useState<InputProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<InputProfile | null>(null);
  const [devices, setDevices] = useState<DetectedDevice[]>([]);
  const [listeningFor, setListeningFor] = useState<
    | { type: 'snes'; button: SnesButton }
    | { type: 'function'; action: FunctionAction }
    | null
  >(null);
  const [dragOverBindings, setDragOverBindings] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InputProfile | null>(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [confirmPreset, setConfirmPreset] = useState<{ presetId: string; deviceName: string; vid: string; pid: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'controls' | 'enhanced' | 'shortcuts' | 'cheats'>('controls');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [devicesCollapsed, setDevicesCollapsed] = useState(false);
  const loadedRef = useRef(false);

  // ─── Load profiles from disk ───
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      const raw = await window.api.readInputProfiles(profileId);
      let loaded = raw as InputProfile[];

      if (loaded.length === 0) {
        const defaultProfile = profileFromPreset(KEYBOARD_DEFAULT);
        loaded = [defaultProfile];
        await window.api.writeInputProfiles(profileId, loaded);
      }

      setProfiles(loaded);
      const activeId = settings.activeInputProfileId;
      const active = loaded.find(p => p.id === activeId) ?? loaded[0];
      setActiveProfile(active);
      getInputManager().setProfile(active);
    })();
  }, [profileId, settings.activeInputProfileId]);

  // ─── Detect devices via InputManager ───
  useEffect(() => {
    const inputMgr = getInputManager();
    setDevices(inputMgr.getDevices());
    const unsub = inputMgr.onDeviceChange((newDevices) => {
      setDevices(newDevices);
    });
    return unsub;
  }, []);

  // ─── Persist helper ───
  const persistProfiles = useCallback(async (updated: InputProfile[]) => {
    setProfiles(updated);
    await window.api.writeInputProfiles(profileId, updated);
  }, [profileId]);

  const selectProfile = useCallback((profile: InputProfile) => {
    setActiveProfile(profile);
    getInputManager().setProfile(profile);
    onChange({ activeInputProfileId: profile.id });
  }, [onChange]);

  // ─── Create new profile ───
  const handleCreate = useCallback(() => {
    const newProfile: InputProfile = {
      id: `custom-${Date.now()}`,
      name: `Custom Profile ${profiles.length + 1}`,
      deviceType: 'keyboard',
      deviceFamily: 'keyboard',
      mappings: [...KEYBOARD_DEFAULT.defaultMappings],
      isDefault: false,
      assignedDevice: null,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    const updated = [...profiles, newProfile];
    persistProfiles(updated);
    selectProfile(newProfile);
    setNewlyCreatedId(newProfile.id);
  }, [profiles, persistProfiles, selectProfile]);

  // ─── Rename profile ───
  const handleRename = useCallback((profile: InputProfile, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === profile.name) return;

    const updatedProfile: InputProfile = {
      ...profile,
      name: trimmed,
      modifiedAt: Date.now(),
    };

    const updatedProfiles = profiles.map(p =>
      p.id === updatedProfile.id ? updatedProfile : p
    );

    if (activeProfile?.id === updatedProfile.id) {
      setActiveProfile(updatedProfile);
      getInputManager().setProfile(updatedProfile);
    }
    persistProfiles(updatedProfiles);
  }, [profiles, activeProfile, persistProfiles]);

  // ─── Delete profile ───
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    const updated = profiles.filter(p => p.id !== deleteTarget.id);
    persistProfiles(updated);
    if (activeProfile?.id === deleteTarget.id) {
      const fallback = updated[0] ?? null;
      if (fallback) selectProfile(fallback);
    }
    setDeleteTarget(null);
  }, [deleteTarget, profiles, activeProfile, persistProfiles, selectProfile]);

  // ─── Rebind handlers ───
  const handleSnesRebind = useCallback((snesButton: SnesButton) => {
    setListeningFor({ type: 'snes', button: snesButton });
  }, []);

  const handleFunctionRebind = useCallback((action: FunctionAction) => {
    setListeningFor({ type: 'function', action });
  }, []);

  // ─── Clear a SNES button binding ───
  const handleSnesClear = useCallback((snesButton: SnesButton) => {
    if (!activeProfile) return;
    const updatedMappings = activeProfile.mappings.map(m => {
      if (m.snesButton !== snesButton) return m;
      return { ...m, binding: { type: 'none' as const }, icon: null, sourceVid: null, sourcePid: null };
    });
    const updatedProfile: InputProfile = { ...activeProfile, mappings: updatedMappings, modifiedAt: Date.now() };
    const updatedProfiles = profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p);
    setActiveProfile(updatedProfile);
    getInputManager().setProfile(updatedProfile);
    persistProfiles(updatedProfiles);
  }, [activeProfile, profiles, persistProfiles]);

  // ─── Function mappings resolution ───
  const functionMappings: FunctionMapping[] = useMemo(() => {
    if (settings.functionMappings && settings.functionMappings.length > 0) {
      const existing = new Set(settings.functionMappings.map(m => m.action));
      const merged = [...settings.functionMappings];
      for (const def of DEFAULT_FUNCTION_MAPPINGS) {
        if (!existing.has(def.action)) merged.push(def);
      }
      return merged;
    }
    return DEFAULT_FUNCTION_MAPPINGS;
  }, [settings.functionMappings]);

  const displayFunctionMappings: FunctionMapping[] = useMemo(() => {
    return functionMappings.map(m => {
      const icon = resolveFunctionMappingIcon(m);
      return icon ? { ...m, icon } : m;
    });
  }, [functionMappings]);

  // ─── Clear a function action binding ───
  const handleFunctionClear = useCallback((action: FunctionAction) => {
    const updatedFn = functionMappings.map(m => {
      if (m.action !== action) return m;
      return { ...m, binding: { type: 'none' as const }, icon: null, sourceVid: null, sourcePid: null };
    });
    onChange({ functionMappings: updatedFn });
  }, [functionMappings, onChange]);

  // ─── Handle captured input ───
  const handleCapture = useCallback((binding: InputBinding, sourceDeviceKey?: string, vendorId?: string | null, productId?: string | null) => {
    if (!listeningFor) return;
    setListeningFor(null);

    const vid = vendorId ? padHex(vendorId) : null;
    const pid = productId ? padHex(productId) : null;

    if (listeningFor.type === 'snes') {
      if (!activeProfile) return;
      const updatedMappings = activeProfile.mappings.map(m => {
        if (m.snesButton !== listeningFor.button) return m;
        return {
          ...m,
          binding,
          icon: null,
          sourceVid: binding.type !== 'keyboard' ? vid : null,
          sourcePid: binding.type !== 'keyboard' ? pid : null,
        };
      });

      const updatedProfile: InputProfile = {
        ...activeProfile,
        mappings: updatedMappings,
        modifiedAt: Date.now(),
      };

      const updatedProfiles = profiles.map(p =>
        p.id === updatedProfile.id ? updatedProfile : p
      );

      setActiveProfile(updatedProfile);
      getInputManager().setProfile(updatedProfile);
      persistProfiles(updatedProfiles);
    } else {
      const updatedFn = functionMappings.map(m => {
        if (m.action === listeningFor.action) {
          return {
            ...m,
            binding,
            icon: null,
            sourceVid: binding.type !== 'keyboard' ? vid : null,
            sourcePid: binding.type !== 'keyboard' ? pid : null,
          };
        }
        if (binding.type === 'gamepad-button' && m.binding.type === 'gamepad-button' && m.binding.index === binding.index) {
          return { ...m, binding: { type: 'none' as const }, icon: null, sourceVid: null, sourcePid: null };
        }
        if (binding.type === 'gamepad-axis' && m.binding.type === 'gamepad-axis' &&
            m.binding.axisIndex === binding.axisIndex && m.binding.direction === binding.direction) {
          return { ...m, binding: { type: 'none' as const }, icon: null, sourceVid: null, sourcePid: null };
        }
        return m;
      });
      onChange({ functionMappings: updatedFn });
    }
  }, [listeningFor, activeProfile, profiles, persistProfiles, functionMappings, onChange]);

  // ─── Drag & drop ───
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/x-preset-id')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setDragOverBindings(true);
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverBindings(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverBindings(false);

    const presetId = e.dataTransfer.getData('application/x-preset-id');
    const deviceId = e.dataTransfer.getData('application/x-device-id');
    const vid = e.dataTransfer.getData('application/x-vid');
    const pid = e.dataTransfer.getData('application/x-pid');
    if (!presetId) return;

    const device = devices.find(d => d.id === deviceId);
    setConfirmPreset({
      presetId,
      deviceName: device?.displayName ?? 'Unknown Device',
      vid: vid || device?.vendorId || '',
      pid: pid || device?.productId || '',
    });
  }, [devices]);

  // ─── Apply preset ───
  const handleApplyPreset = useCallback(() => {
    if (!confirmPreset || !activeProfile) return;

    const preset = findPresetById(confirmPreset.presetId);
    if (!preset) {
      setConfirmPreset(null);
      return;
    }

    const vid = confirmPreset.vid ? padHex(confirmPreset.vid) : '';
    const pid = confirmPreset.pid ? padHex(confirmPreset.pid) : '';

    const mappingsWithSource = preset.defaultMappings.map(m => ({
      ...m,
      icon: m.binding.type === 'gamepad-axis' ? m.icon : null,
      sourceVid: m.binding.type !== 'keyboard' ? vid : null,
      sourcePid: m.binding.type !== 'keyboard' ? pid : null,
    }));

    const updatedProfile: InputProfile = {
      ...activeProfile,
      name: preset.name,
      deviceType: preset.family === 'keyboard' ? 'keyboard' : 'gamepad',
      deviceFamily: preset.family,
      mappings: mappingsWithSource,
      assignedDevice: preset.family !== 'keyboard' ? {
        vendorId: vid,
        productId: pid,
        displayName: confirmPreset.deviceName,
        deviceFamily: preset.family,
        presetId: preset.id,
      } : null,
      modifiedAt: Date.now(),
    };

    const updatedProfiles = profiles.map(p =>
      p.id === updatedProfile.id ? updatedProfile : p
    );

    setActiveProfile(updatedProfile);
    getInputManager().setProfile(updatedProfile);
    persistProfiles(updatedProfiles);
    setConfirmPreset(null);
  }, [confirmPreset, activeProfile, profiles, persistProfiles]);

  // ─── Required inputs ───
  const requiredInputs = useMemo(() => {
    if (!activeProfile) return [];
    const inputs: Array<{ type: 'keyboard' | 'gamepad'; label: string; iconSrc: string; connected: boolean }> = [];
    const hasKeyboard = activeProfile.mappings.some(m => m.binding.type === 'keyboard');
    const hasGamepad = activeProfile.mappings.some(m => m.binding.type !== 'keyboard');

    const familyIconMap: Record<string, string> = {
      xbox: '/buttons/xbox/controller_xboxseries.svg',
      nintendo: '/buttons/switch/controller_switch_pro.svg',
      playstation: '/buttons/playstation/controller_playstation5.svg',
      keyboard: '/buttons/keyboard/keyboard.svg',
      generic: '/buttons/generic/generic_joystick.svg',
    };

    if (hasKeyboard) {
      inputs.push({
        type: 'keyboard',
        label: 'Keyboard',
        iconSrc: familyIconMap.keyboard,
        connected: devices.some(d => d.type === 'keyboard' && d.connected),
      });
    }
    if (hasGamepad) {
      const usedDeviceKeys = new Set<string>();
      for (const m of activeProfile.mappings) {
        if (m.binding.type !== 'keyboard' && m.sourceVid && m.sourcePid) {
          usedDeviceKeys.add(`${padHex(m.sourceVid)}:${padHex(m.sourcePid)}`);
        }
      }
      const assigned = activeProfile.assignedDevice;
      if (assigned?.vendorId && assigned?.productId) {
        usedDeviceKeys.add(`${padHex(assigned.vendorId)}:${padHex(assigned.productId)}`);
      }

      if (usedDeviceKeys.size > 0) {
        for (const key of usedDeviceKeys) {
          const [vid, pid] = key.split(':');
          const liveDevice = devices.find(d =>
            d.type === 'gamepad' && d.connected &&
            d.vendorId && d.productId &&
            padHex(d.vendorId) === vid && padHex(d.productId) === pid
          );
          const profile = findDeviceProfileByVidPid(vid, pid);
          const family = profile?.family ?? liveDevice?.deviceFamily ?? 'generic';
          const icon = familyIconMap[family] ?? familyIconMap.generic;
          const displayName = profile?.name ?? liveDevice?.displayName ?? 'Controller';
          inputs.push({
            type: 'gamepad',
            label: `${displayName} (${vid}:${pid})`,
            iconSrc: icon,
            connected: !!liveDevice,
          });
        }
      } else {
        const family = activeProfile.deviceFamily;
        const icon = familyIconMap[family] ?? familyIconMap.generic;
        inputs.push({
          type: 'gamepad',
          label: activeProfile.name,
          iconSrc: icon,
          connected: devices.some(d => d.type === 'gamepad' && d.connected),
        });
      }
    }
    return inputs;
  }, [activeProfile, devices]);

  // ─── Display mappings with icons ───
  const displayMappings = useMemo(() => {
    return SNES_BUTTONS.map(btn => {
      const existing = activeProfile?.mappings.find(m => m.snesButton === btn);
      if (!existing) {
        return { snesButton: btn, binding: { type: 'none' as const }, icon: null };
      }
      if (existing.binding.type === 'none' || existing.binding.type === 'keyboard') return { ...existing, icon: null };

      const vid = existing.sourceVid ? padHex(existing.sourceVid) : null;
      const pid = existing.sourcePid ? padHex(existing.sourcePid) : null;
      if (!vid || !pid) {
        return existing.icon?.key ? existing : { ...existing, icon: null };
      }

      const profile = findDeviceProfileByVidPid(vid, pid);
      if (!profile) return { ...existing, icon: null };

      if (existing.binding.type === 'gamepad-button') {
        const b = profile.buttons[existing.binding.index];
        if (b) return { ...existing, icon: { key: b.icon, label: b.label, path: null } };
      }
      if (existing.binding.type === 'gamepad-axis') {
        if (existing.icon?.key) return existing;
        const ax = profile.axes?.[existing.binding.axisIndex];
        if (ax) {
          const dir = existing.binding.direction === '+' ? '+' : '\u2212';
          return { ...existing, icon: { key: `${profile.id}-axis`, label: `${ax.label} ${dir}`, path: null } };
        }
      }
      return { ...existing, icon: null };
    });
  }, [activeProfile]);

  const filteredDevices = devices.filter(d => !d.displayName.toLowerCase().includes('mouse'));

  return {
    profiles,
    activeProfile,
    devices,
    filteredDevices,
    listeningFor,
    dragOverBindings,
    deleteTarget,
    newlyCreatedId,
    confirmPreset,
    activeTab,
    sidebarCollapsed,
    devicesCollapsed,
    requiredInputs,
    displayMappings,
    displayFunctionMappings,
    setActiveTab,
    setSidebarCollapsed,
    setDevicesCollapsed,
    setListeningFor,
    setDeleteTarget,
    setConfirmPreset,
    selectProfile,
    handleCreate,
    handleRename,
    handleDeleteConfirm,
    handleSnesRebind,
    handleFunctionRebind,
    handleSnesClear,
    handleFunctionClear,
    handleCapture,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleApplyPreset,
  };
}

export { useControlsSettings };
