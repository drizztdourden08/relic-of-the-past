/**
 * ControlsSettings — full input mapping UI.
 *
 * Layout:
 *  Left column:  InputProfileList (saved input profiles)
 *  Center column: Assigned controller card + binding editor
 *  Right column: Detected devices (draggable)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type {
  InputProfile,
  DetectedDevice,
  ButtonMapping,
  InputBinding,
  SnesButton,
  AssignedController,
} from '@shared/types/controls';
import { SNES_BUTTONS } from '@shared/types/controls';
import { findPresetById, KEYBOARD_DEFAULT } from '@shared/data/controllers';
import { getInputManager, profileFromPreset } from '../../../../lib/game/input-manager';
import { detectAllDevices, updateActivationState, markActivated } from '../../../../lib/game/controller-detect';
import { InputProfileList } from './controls/InputProfileList';
import { DeviceCard } from './controls/DeviceCard';
import { BindingRow } from './controls/BindingRow';
import { BindingListener } from './controls/BindingListener';
import { AssignedControllerCard } from './controls/AssignedControllerCard';
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

      setProfiles(loaded);

      // Set active profile
      const activeId = settings.activeInputProfileId;
      const active = loaded.find(p => p.id === activeId) ?? loaded[0];
      setActiveProfile(active);
      getInputManager().setProfile(active);
    })();
  }, [profileId, settings.activeInputProfileId]);

  // ─── Detect devices (HID + Web API) ───
  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        hidCacheRef.current = await window.api.enumerateHidDevices();
      } catch { /* node-hid may fail on some systems */ }
      if (!cancelled) {
        updateActivationState();
        setDevices(detectAllDevices(hidCacheRef.current));
      }
    };

    refresh();

    const onConnect = (e: GamepadEvent) => {
      // Chromium fires gamepadconnected for ALL gamepads when ANY gets first input.
      // At event time, button state is often all-zeros.
      // Poll rapidly for a short window to catch the actual button press.
      const idx = e.gamepad.index;
      let attempts = 0;
      const check = () => {
        const gp = navigator.getGamepads()[idx];
        if (gp) {
          const hasInput = gp.buttons.some(b => b.pressed || b.value > 0.5) ||
                           gp.axes.some(a => Math.abs(a) > 0.5);
          if (hasInput) {
            markActivated(idx);
            setDevices(detectAllDevices(hidCacheRef.current));
            return; // done
          }
        }
        attempts++;
        if (attempts < 10) {
          requestAnimationFrame(check);
        } else {
          // Fallback: refresh anyway (updateActivationState in the 2s poll will catch it)
          setDevices(detectAllDevices(hidCacheRef.current));
        }
      };
      requestAnimationFrame(check);
    };
    const onDisconnect = () => {
      setDevices(detectAllDevices(hidCacheRef.current));
    };
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('gamepaddisconnected', onDisconnect);

    // Poll: re-enumerate HID + refresh activation status
    const pollId = setInterval(() => {
      refresh();
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(pollId);
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('gamepaddisconnected', onDisconnect);
    };
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

  const handleCapture = useCallback((binding: InputBinding) => {
    if (!listeningFor || !activeProfile) return;
    setListeningFor(null);

    const updatedMappings = activeProfile.mappings.map(m =>
      m.snesButton === listeningFor
        ? { ...m, binding, icon: m.icon } // preserve icon, update binding
        : m
    );

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

    const assignedController: AssignedController | null =
      confirmPreset.vid && confirmPreset.pid
        ? {
            vendorId: confirmPreset.vid,
            productId: confirmPreset.pid,
            displayName: confirmPreset.deviceName,
            controllerFamily: preset.family,
            presetId: preset.id,
          }
        : null;

    const updatedProfile: InputProfile = {
      ...activeProfile,
      name: preset.name,
      deviceType: preset.family === 'keyboard' ? 'keyboard' : 'gamepad',
      controllerFamily: preset.family,
      mappings: [...preset.defaultMappings],
      assignedController,
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

  // ─── Unassign controller from profile ───
  const handleUnassign = useCallback(() => {
    if (!activeProfile) return;
    const updatedProfile: InputProfile = {
      ...activeProfile,
      assignedController: null,
      modifiedAt: Date.now(),
    };
    const updatedProfiles = profiles.map(p =>
      p.id === updatedProfile.id ? updatedProfile : p
    );
    setActiveProfile(updatedProfile);
    persistProfiles(updatedProfiles);
  }, [activeProfile, profiles, persistProfiles]);

  // ─── Find live device matching assigned controller ───
  const assignedLiveDevice = activeProfile?.assignedController
    ? devices.find(d =>
        d.vendorId === activeProfile.assignedController!.vendorId &&
        d.productId === activeProfile.assignedController!.productId
      ) ?? null
    : null;

  // ─── Ensure all SNES buttons have a mapping ───
  const displayMappings = SNES_BUTTONS.map(btn => {
    const existing = activeProfile?.mappings.find(m => m.snesButton === btn);
    return existing ?? {
      snesButton: btn,
      binding: { type: 'keyboard' as const, code: '', label: '—' },
      icon: null,
    };
  });

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

      {/* Center column: assigned controller + binding editor */}
      <div className="controls-settings__main">
        {activeProfile?.assignedController && (
          <AssignedControllerCard
            assigned={activeProfile.assignedController}
            liveDevice={assignedLiveDevice}
            onUnassign={handleUnassign}
          />
        )}

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
            {displayMappings.map(mapping => (
              <BindingRow
                key={mapping.snesButton}
                mapping={mapping}
                onRebind={handleRebind}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right column: detected devices */}
      <div className="controls-settings__devices-column">
        <div className="controls-settings__section-header">Detected Devices</div>
        <div className="controls-settings__device-list">
          {devices.map(device => (
            <DeviceCard key={device.id} device={device} />
          ))}
          {devices.length === 0 && (
            <p className="controls-settings__no-devices">No devices detected</p>
          )}
        </div>
        <p className="controls-settings__device-hint">
          Drag a device onto the bindings to assign it and apply its preset.
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
