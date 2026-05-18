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
  FunctionAction,
  FunctionMapping,
} from '@shared/types/controls';
import {
  SNES_BUTTONS,
  SNES_BUTTON_LABELS,
  SNES_ACTION_LABELS,
  SHORTCUT_ACTIONS,
  CHEAT_ACTIONS,
  FUNCTION_ACTION_LABELS,
  DEFAULT_FUNCTION_MAPPINGS,
} from '@shared/types/controls';
import { findPresetById, KEYBOARD_DEFAULT } from '@shared/input';
import { findDeviceProfileByVidPid } from '@shared/input';
import { getInputManager, profileFromPreset, resolveFunctionMappingIcon } from '../../../../lib/input/input-manager';
import { InputProfileList } from './controls/InputProfileList';
import { DeviceCard } from './controls/DeviceCard';
import { BindingRow } from './controls/BindingRow';
import { BindingListener } from './controls/BindingListener';
import { getSnesIconUrl } from '../../InputTester/button-icons';
import { Dialog } from '../../../composites/Dialog/Dialog';
import './ControlsSettings.css';

interface ControlsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profileId: string;
}

/** Pad a hex VID/PID to 4 chars lowercase, e.g. "57e" → "057e" */
function padHex(v: string): string {
  return v.toLowerCase().padStart(4, '0');
}

export function ControlsSettings({ settings, onChange, profileId }: ControlsSettingsProps): JSX.Element {
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
  const loadedRef = useRef(false);

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

  // ─── Detect devices via InputManager (single source of truth) ───
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

  // ─── Rebind a SNES button ───
  const handleSnesRebind = useCallback((snesButton: SnesButton) => {
    setListeningFor({ type: 'snes', button: snesButton });
  }, []);

  // ─── Rebind a function action (shortcut / cheat) ───
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

  // ─── Resolve current function mappings from settings (or defaults) ───
  const functionMappings: FunctionMapping[] = useMemo(() => {
    if (settings.functionMappings && settings.functionMappings.length > 0) {
      // Ensure all actions are present (merge with defaults for any missing)
      const existing = new Set(settings.functionMappings.map(m => m.action));
      const merged = [...settings.functionMappings];
      for (const def of DEFAULT_FUNCTION_MAPPINGS) {
        if (!existing.has(def.action)) merged.push(def);
      }
      return merged;
    }
    return DEFAULT_FUNCTION_MAPPINGS;
  }, [settings.functionMappings]);

  // ─── Resolve gamepad icons for function mappings at render time ───
  // Icons are NEVER stored — always derived from sourceVid:sourcePid + button index.
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

  /**
   * Handle a captured input from BindingListener.
   * Stores ONLY the binding + padded sourceVid/sourcePid. Never stores icons.
   * Icons are always derived at render time in displayMappings via DEVICE_PROFILES.
   */
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
      // Function action (shortcut / cheat)
      // Clear this binding from any OTHER action that uses the same gamepad button/axis
      // (prevents conflicts where two actions share the same physical button)
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
        // Steal: clear conflicting gamepad bindings from other actions
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

  /**
   * Apply a controller preset via drag-drop.
   * Strips all preset icons — icons are ALWAYS resolved at render time from DEVICE_PROFILES.
   */
  const handleApplyPreset = useCallback(() => {
    if (!confirmPreset || !activeProfile) return;

    const preset = findPresetById(confirmPreset.presetId);
    if (!preset) {
      setConfirmPreset(null);
      return;
    }

    const vid = confirmPreset.vid ? padHex(confirmPreset.vid) : '';
    const pid = confirmPreset.pid ? padHex(confirmPreset.pid) : '';

    // Strip button icons (re-derived at render time) but keep axis icons (direction-specific)
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
      // Collect unique devices referenced in bindings (padded for dedup)
      const usedDeviceKeys = new Set<string>();
      for (const m of activeProfile.mappings) {
        if (m.binding.type !== 'keyboard' && m.sourceVid && m.sourcePid) {
          usedDeviceKeys.add(`${padHex(m.sourceVid)}:${padHex(m.sourcePid)}`);
        }
      }
      // Also include assigned controller if set
      const assigned = activeProfile.assignedDevice;
      if (assigned?.vendorId && assigned?.productId) {
        usedDeviceKeys.add(`${padHex(assigned.vendorId)}:${padHex(assigned.productId)}`);
      }

      if (usedDeviceKeys.size > 0) {
        for (const key of usedDeviceKeys) {
          const [vid, pid] = key.split(':');
          // Find this device in connected list (pad device VIDs for comparison)
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
        // No sourceVid/Pid on any mapping — show generic based on profile family
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

  // ─── Resolve ALL gamepad icons at render time from DEVICE_PROFILES ───
  // This is the SINGLE source of truth for button icons and labels.
  // Gamepad icons are NEVER stored — always derived from sourceVid:sourcePid + button index.
  const displayMappings = useMemo(() => {
    return SNES_BUTTONS.map(btn => {
      const existing = activeProfile?.mappings.find(m => m.snesButton === btn);
      if (!existing) {
        return { snesButton: btn, binding: { type: 'none' as const }, icon: null };
      }
      // None or keyboard bindings: no controller icon needed
      if (existing.binding.type === 'none' || existing.binding.type === 'keyboard') return { ...existing, icon: null };

      // Gamepad bindings: ALWAYS resolve from DEVICE_PROFILES via sourceVid:sourcePid
      const vid = existing.sourceVid ? padHex(existing.sourceVid) : null;
      const pid = existing.sourcePid ? padHex(existing.sourcePid) : null;
      if (!vid || !pid) {
        // No source device — use the stored icon if present (e.g. default mappings with stick icons)
        return existing.icon?.key ? existing : { ...existing, icon: null };
      }

      const profile = findDeviceProfileByVidPid(vid, pid);
      if (!profile) return { ...existing, icon: null };

      if (existing.binding.type === 'gamepad-button') {
        const b = profile.buttons[existing.binding.index];
        if (b) return { ...existing, icon: { key: b.icon, label: b.label, path: null } };
      }
      if (existing.binding.type === 'gamepad-axis') {
        // Use the stored icon if it has a valid key (e.g. stick direction icons)
        if (existing.icon?.key) {
          return existing;
        }
        const ax = profile.axes?.[existing.binding.axisIndex];
        if (ax) {
          const dir = existing.binding.direction === '+' ? '+' : '−';
          return { ...existing, icon: { key: `${profile.id}-axis`, label: `${ax.label} ${dir}`, path: null } };
        }
      }
      return { ...existing, icon: null };
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

      {/* Center column: tabbed content */}
      <div className="controls-settings__main">
        {/* Tab bar */}
        <div className="controls-settings__tabs">
          <button
            className={`controls-settings__tab ${activeTab === 'controls' ? 'controls-settings__tab--active' : ''}`}
            onClick={() => setActiveTab('controls')}
          >Game Controls</button>
          <button
            className={`controls-settings__tab ${activeTab === 'enhanced' ? 'controls-settings__tab--active' : ''}`}
            onClick={() => setActiveTab('enhanced')}
          >Enhanced Controls</button>
          <button
            className={`controls-settings__tab ${activeTab === 'shortcuts' ? 'controls-settings__tab--active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >Shortcuts &amp; Functions</button>
          <button
            className={`controls-settings__tab ${activeTab === 'cheats' ? 'controls-settings__tab--active' : ''}`}
            onClick={() => setActiveTab('cheats')}
          >Cheats</button>
        </div>

        {/* Tab content */}
        {activeTab === 'controls' && (
          <>
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
                    actionLabel={SNES_ACTION_LABELS[mapping.snesButton]}
                    middleLabel={SNES_BUTTON_LABELS[mapping.snesButton]}
                    middleIconUrl={getSnesIconUrl(mapping.snesButton)}
                    binding={mapping.binding}
                    bindingIcon={mapping.icon}
                    onRebind={() => handleSnesRebind(mapping.snesButton)}
                    onClear={() => handleSnesClear(mapping.snesButton)}
                  />
                ))}
              </div>
            </div>

            {/* Used inputs summary */}
            <div className="controls-settings__used-inputs">
              <div className="controls-settings__used-inputs-header">Required Inputs</div>
              <div className="controls-settings__used-inputs-list">
                {requiredInputs.map((input, idx) => (
                  <div key={`${input.type}-${idx}`} className="controls-settings__used-input">
                    <span className={`controls-settings__used-input-dot ${input.connected ? 'controls-settings__used-input-dot--active' : 'controls-settings__used-input-dot--disconnected'}`} />
                    <img src={input.iconSrc} alt={input.label} className="controls-settings__used-input-icon" />
                    <span className={input.connected ? '' : 'controls-settings__used-input-label--dim'}>{input.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'enhanced' && (
          <div className="controls-settings__placeholder">
            <p className="controls-settings__placeholder-text">Enhanced controls coming soon.</p>
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <div className="controls-settings__bindings">
            <div className="controls-settings__section-header">Keyboard Shortcuts</div>
            <div className="controls-settings__binding-list">
              <div className="binding-row binding-row--header">
                <span className="binding-row__action-label">Action</span>
                <div className="binding-row__icon-slot" />
                <span className="binding-row__snes-label" />
                <div className="binding-row__icon-slot" />
                <span className="binding-row__binding-label">Binding</span>
              </div>
              {displayFunctionMappings
                .filter(m => (SHORTCUT_ACTIONS as readonly string[]).includes(m.action))
                .map(mapping => (
                  <BindingRow
                    key={mapping.action}
                    actionLabel={FUNCTION_ACTION_LABELS[mapping.action]}
                    binding={mapping.binding}
                    bindingIcon={mapping.icon}
                    onRebind={() => handleFunctionRebind(mapping.action)}
                    onClear={() => handleFunctionClear(mapping.action)}
                  />
                ))}
            </div>
          </div>
        )}

        {activeTab === 'cheats' && (
          <div className="controls-settings__bindings">
            <div className="controls-settings__section-header">Cheat Bindings</div>
            <div className="controls-settings__binding-list">
              <div className="binding-row binding-row--header">
                <span className="binding-row__action-label">Action</span>
                <div className="binding-row__icon-slot" />
                <span className="binding-row__snes-label" />
                <div className="binding-row__icon-slot" />
                <span className="binding-row__binding-label">Binding</span>
              </div>
              {displayFunctionMappings
                .filter(m => (CHEAT_ACTIONS as readonly string[]).includes(m.action))
                .map(mapping => (
                  <BindingRow
                    key={mapping.action}
                    actionLabel={FUNCTION_ACTION_LABELS[mapping.action]}
                    binding={mapping.binding}
                    bindingIcon={mapping.icon}
                    onRebind={() => handleFunctionRebind(mapping.action)}
                    onClear={() => handleFunctionClear(mapping.action)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Right column: detected devices */}
      <div className="controls-settings__devices-column">
        <div className="controls-settings__section-header">Detected Devices</div>
        <div className="controls-settings__device-list">
          {devices.filter(d => !d.displayName.toLowerCase().includes('mouse')).map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onAssign={(d) => {
                if (!d.presetId) return;
                setConfirmPreset({
                  presetId: d.presetId,
                  deviceName: d.displayName,
                  vid: d.vendorId ?? '',
                  pid: d.productId ?? '',
                });
              }}
            />
          ))}
          {devices.filter(d => !d.displayName.toLowerCase().includes('mouse')).length === 0 && (
            <p className="controls-settings__no-devices">No devices detected</p>
          )}
        </div>
        <p className="controls-settings__device-hint">
          Click controller icon or drag onto bindings to assign.
        </p>
      </div>

      {/* Rebind listener modal */}
      {listeningFor && (
        <BindingListener
          actionLabel={
            listeningFor.type === 'snes'
              ? SNES_BUTTON_LABELS[listeningFor.button]
              : FUNCTION_ACTION_LABELS[listeningFor.action]
          }
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
