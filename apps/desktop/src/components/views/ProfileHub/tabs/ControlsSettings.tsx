/**
 * ControlsSettings — full input mapping UI.
 *
 * Layout:
 *  Left column:  InputProfileList (saved input profiles)
 *  Center column: Binding editor + used inputs summary
 *  Right column: Detected devices (draggable)
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type {
  InputProfile,
  DetectedDevice,
  ButtonMapping,
  InputBinding,
  SnesButton,
} from '@shared/types/controls';
import { SNES_BUTTONS } from '@shared/types/controls';
import { findPresetById, findPresetByVidPid, KEYBOARD_DEFAULT } from '@shared/data/controllers';
import { CONTROLLER_PROFILES, findProfileByVidPid } from '@shared/data/controllers/profiles';
import { getInputManager, profileFromPreset } from '../../../../lib/game/input-manager';
import { InputProfileList } from './controls/InputProfileList';
import { DeviceCard } from './controls/DeviceCard';
import { BindingRow } from './controls/BindingRow';
import { BindingListener } from './controls/BindingListener';
import { Dialog } from '../../../composites/Dialog/Dialog';
import './ControlsSettings.css';

interface ControlsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profileId: string;
}

export function ControlsSettings({ settings, onChange, profileId }: ControlsSettingsProps): JSX.Element {
  const [profiles, setProfiles] = useState<InputProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<InputProfile | null>(null);
  const [devices, setDevices] = useState<DetectedDevice[]>([]);
  const [listeningFor, setListeningFor] = useState<SnesButton | null>(null);
  const [dragOverBindings, setDragOverBindings] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InputProfile | null>(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [confirmPreset, setConfirmPreset] = useState<{ presetId: string; deviceName: string; vid: string; pid: string } | null>(null);
  const loadedRef = useRef(false);
  const hidCacheRef = useRef<Array<{ vendorId: string; productId: string; product: string; manufacturer: string; path: string; serialNumber: string | null }>>([]);

  // ─── Load profiles from disk ───
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      const raw = await window.api.readInputProfiles(profileId);
      let loaded = raw as InputProfile[];

      // Ensure at least a keyboard default exists
      if (loaded.length === 0) {
        const defaultProfile = profileFromPreset(KEYBOARD_DEFAULT);
        loaded = [defaultProfile];
        await window.api.writeInputProfiles(profileId, loaded);
      }

      // Reconcile icons: if a profile has a preset but its mappings are missing
      // icons (from before icons were added), fill them in from the preset.
      let needsPersist = false;
      loaded = loaded.map(profile => {
        const presetId = profile.assignedController?.presetId;
        if (!presetId) return profile;
        const preset = findPresetById(presetId);
        if (!preset) return profile;

        let changed = false;
        const mappings = profile.mappings.map(m => {
          if (m.icon) return m; // already has icon
          // Find matching icon from preset by binding index
          const presetMapping = preset.defaultMappings.find(pm =>
            pm.binding.type === m.binding.type &&
            ((m.binding.type === 'gamepad-button' && pm.binding.type === 'gamepad-button' && pm.binding.index === m.binding.index) ||
             (m.binding.type === 'gamepad-axis' && pm.binding.type === 'gamepad-axis' && pm.binding.axisIndex === m.binding.axisIndex && pm.binding.direction === m.binding.direction)),
          );
          if (presetMapping?.icon) {
            changed = true;
            return { ...m, icon: presetMapping.icon };
          }
          return m;
        });

        if (changed) {
          needsPersist = true;
          return { ...profile, mappings };
        }
        return profile;
      });

      if (needsPersist) {
        await window.api.writeInputProfiles(profileId, loaded);
      }

      setProfiles(loaded);

      // Set active profile
      const activeId = settings.activeInputProfileId;
      const active = loaded.find(p => p.id === activeId) ?? loaded[0];
      setActiveProfile(active);
      getInputManager().setProfile(active);
    })();
  }, [profileId, settings.activeInputProfileId]);

  // ─── Detect devices via InputManager (single source of truth) ───
  useEffect(() => {
    const inputMgr = getInputManager();
    // Get initial devices
    setDevices(inputMgr.getDevices());

    // Also do HID enum for accurate model names (InputManager handles activation)
    window.api.enumerateHidDevices()
      .then(hid => { hidCacheRef.current = hid; })
      .catch(() => {});

    // Subscribe to device changes
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
      controllerFamily: 'keyboard',
      mappings: [...KEYBOARD_DEFAULT.defaultMappings],
      isDefault: false,
      assignedController: null,
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

  // ─── Rebind a button ───
  const handleRebind = useCallback((mapping: ButtonMapping) => {
    setListeningFor(mapping.snesButton);
  }, []);

  const handleCapture = useCallback((binding: InputBinding, sourceDeviceKey?: string, vendorId?: string | null, productId?: string | null) => {
    if (!listeningFor || !activeProfile) return;
    setListeningFor(null);

    // Resolve VID/PID: event → assigned controller fallback
    const vid = vendorId ?? activeProfile.assignedController?.vendorId ?? null;
    const pid = productId ?? activeProfile.assignedController?.productId ?? null;

    // Resolve icon from the source device's controller profile
    const resolveIcon = (): ButtonMapping['icon'] => {
      if (binding.type === 'keyboard') return null;
      if (!vid || !pid) return null;

      if (binding.type === 'gamepad-button') {
        const profile = findProfileByVidPid(vid, pid);
        if (profile) {
          const btn = profile.buttons[binding.index];
          if (btn) return { key: btn.icon, label: btn.label };
        }
      }
      if (binding.type === 'gamepad-axis') {
        const preset = findPresetByVidPid(vid, pid);
        if (preset) {
          const pm = preset.defaultMappings.find(m =>
            m.binding.type === 'gamepad-axis' &&
            m.binding.axisIndex === binding.axisIndex &&
            m.binding.direction === binding.direction
          );
          if (pm?.icon) return pm.icon;
        }
      }
      return null;
    };

    const updatedMappings = activeProfile.mappings.map(m => {
      if (m.snesButton !== listeningFor) return m;
      return {
        ...m,
        binding,
        icon: resolveIcon(),
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
  }, [listeningFor, activeProfile, profiles, persistProfiles]);

  // ─── Drag & drop preset application ───
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

  const handleApplyPreset = useCallback(() => {
    if (!confirmPreset || !activeProfile) return;

    const preset = findPresetById(confirmPreset.presetId);
    if (!preset) {
      setConfirmPreset(null);
      return;
    }

    const updatedProfile: InputProfile = {
      ...activeProfile,
      name: preset.name,
      deviceType: preset.family === 'keyboard' ? 'keyboard' : 'gamepad',
      controllerFamily: preset.family,
      mappings: [...preset.defaultMappings],
      assignedController: preset.family !== 'keyboard' ? {
        vendorId: confirmPreset.vid,
        productId: confirmPreset.pid,
        displayName: confirmPreset.deviceName,
        controllerFamily: preset.family,
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

  // ─── Determine which input devices are used by this profile ───
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
      // Show ALL connected gamepads as required inputs (profile may use bindings from multiple controllers)
      const connectedGamepads = devices.filter(d => d.type === 'gamepad' && d.connected);
      if (connectedGamepads.length > 0) {
        for (const dev of connectedGamepads) {
          const icon = familyIconMap[dev.controllerFamily] ?? familyIconMap.generic;
          const label = dev.vendorId && dev.productId
            ? `${dev.displayName} (${dev.vendorId}:${dev.productId})`
            : dev.displayName;
          inputs.push({
            type: 'gamepad',
            label,
            iconSrc: icon,
            connected: true,
          });
        }
      } else {
        // No connected gamepads — show assigned controller as disconnected
        const assigned = activeProfile.assignedController;
        const family = assigned?.controllerFamily ?? activeProfile.controllerFamily;
        const icon = familyIconMap[family] ?? familyIconMap.generic;
        const label = assigned
          ? `${assigned.displayName} (${assigned.vendorId}:${assigned.productId})`
          : activeProfile.name;
        inputs.push({
          type: 'gamepad',
          label,
          iconSrc: icon,
          connected: false,
        });
      }
    }
    return inputs;
  }, [activeProfile, devices]);

  // ─── Ensure all SNES buttons have a mapping, resolve missing icons from persisted sourceVid/Pid ───
  const displayMappings = useMemo(() => {
    return SNES_BUTTONS.map(btn => {
      const existing = activeProfile?.mappings.find(m => m.snesButton === btn);
      if (!existing) {
        return { snesButton: btn, binding: { type: 'keyboard' as const, code: '', label: '—' }, icon: null };
      }
      // If already has an icon, use as-is
      if (existing.icon) return existing;
      // Resolve missing icon using the binding's own sourceVid/Pid (or profile's assigned controller)
      const vid = existing.sourceVid ?? activeProfile?.assignedController?.vendorId ?? null;
      const pid = existing.sourcePid ?? activeProfile?.assignedController?.productId ?? null;
      if (!vid || !pid) return existing;

      if (existing.binding.type === 'gamepad-button') {
        const profile = findProfileByVidPid(vid, pid);
        if (profile) {
          const b = profile.buttons[existing.binding.index];
          if (b) return { ...existing, icon: { key: b.icon, label: b.label } };
        }
      }
      if (existing.binding.type === 'gamepad-axis') {
        const preset = findPresetByVidPid(vid, pid);
        if (preset) {
          const pm = preset.defaultMappings.find(m =>
            m.binding.type === 'gamepad-axis' &&
            m.binding.axisIndex === existing.binding.axisIndex &&
            m.binding.direction === existing.binding.direction
          );
          if (pm?.icon) return { ...existing, icon: pm.icon };
        }
      }
      return existing;
    });
  }, [activeProfile]);

  return (
    <div className="controls-settings">
      {/* Left column: profile list */}
      <div className="controls-settings__sidebar">
        <InputProfileList
          profiles={profiles}
          activeId={activeProfile?.id ?? null}
          initialEditId={newlyCreatedId}
          onSelect={selectProfile}
          onDelete={(p) => setDeleteTarget(p)}
          onRename={handleRename}
          onCreate={handleCreate}
        />
      </div>

      {/* Center column: binding editor */}
      <div className="controls-settings__main">
        <div
          className={`controls-settings__bindings ${dragOverBindings ? 'controls-settings__bindings--drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="controls-settings__section-header">
            Button Mappings
            {activeProfile && (
              <span className="controls-settings__profile-badge">
                {activeProfile.name}
              </span>
            )}
          </div>
          <div className="controls-settings__binding-list">
            <div className="binding-row binding-row--header">
              <span className="binding-row__action-label">Action</span>
              <div className="binding-row__icon-slot" />
              <span className="binding-row__snes-label">SNES</span>
              <div className="binding-row__icon-slot" />
              <span className="binding-row__binding-label">Binding</span>
            </div>
            {displayMappings.map(mapping => (
              <BindingRow
                key={mapping.snesButton}
                mapping={mapping}
                onRebind={handleRebind}
              />
            ))}
          </div>
        </div>

        {/* Used inputs summary — shows which devices this profile depends on */}
        <div className="controls-settings__used-inputs">
          <div className="controls-settings__used-inputs-header">Required Inputs</div>
          <div className="controls-settings__used-inputs-list">
            {requiredInputs.map((input, idx) => (
              <div key={`${input.type}-${idx}`} className={`controls-settings__used-input ${input.connected ? '' : 'controls-settings__used-input--missing'}`}>
                <img src={input.iconSrc} alt={input.label} className="controls-settings__used-input-icon" />
                <span>{input.label}</span>
                {!input.connected && (
                  <span className="controls-settings__used-input-warning">Disconnected</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right column: detected devices */}
      <div className="controls-settings__devices-column">
        <div className="controls-settings__section-header">Detected Devices</div>
        <div className="controls-settings__device-list">
          {devices.filter(d => !d.displayName.toLowerCase().includes('mouse')).map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
          {devices.filter(d => !d.displayName.toLowerCase().includes('mouse')).length === 0 && (
            <p className="controls-settings__no-devices">No devices detected</p>
          )}
        </div>
        <p className="controls-settings__device-hint">
          Drag a device onto the bindings to apply its preset.
        </p>
      </div>

      {/* Rebind listener modal */}
      {listeningFor && (
        <BindingListener
          snesButton={listeningFor}
          onCapture={handleCapture}
          onCancel={() => setListeningFor(null)}
        />
      )}

      {/* Confirm preset dialog */}
      <Dialog
        open={!!confirmPreset}
        title="Apply Controller Preset"
        message={`Assign "${confirmPreset?.deviceName ?? ''}" to this profile and apply its default mappings? This will overwrite all current bindings.`}
        confirmLabel="Apply"
        cancelLabel="Cancel"
        onConfirm={handleApplyPreset}
        onCancel={() => setConfirmPreset(null)}
      />

      {/* Delete profile dialog */}
      <Dialog
        open={!!deleteTarget}
        title="Delete Input Profile"
        message={`Delete "${deleteTarget?.name ?? ''}"? This cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
