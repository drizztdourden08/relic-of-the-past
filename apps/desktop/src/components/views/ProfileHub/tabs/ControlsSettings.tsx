/* @layer renderer-components @kind component */
/**
 * ControlsSettings — full input mapping UI.
 *
 * Layout:
 *  Left column:  InputProfileList (saved input profiles)
 *  Center column: Binding editor + used inputs summary
 *  Right column: Detected devices (draggable)
 */

import type { GameSettings } from '@shared/types/settings';
import {
  SNES_ACTION_LABELS,
  SNES_BUTTON_LABELS,
  SHORTCUT_ACTIONS,
  CHEAT_ACTIONS,
  FUNCTION_ACTION_LABELS,
} from '@shared/types/controls';
import { InputProfileList } from './controls/InputProfileList';
import { DeviceCard } from './controls/DeviceCard';
import { BindingRow } from './controls/BindingRow';
import { BindingListener } from './controls/BindingListener';
import { getSnesIconUrl, getButtonIconUrl } from '../../InputTester/data/button-icons';
import { Dialog } from '../../../composites/Dialog/Dialog';
import { useControlsSettings } from './useControlsSettings';
import './ControlsSettings.css';

interface ControlsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profileId: string;
}

const ControlsSettings = (props: ControlsSettingsProps) => {
  const { settings, onChange, profileId } = props;
  const ctrl = useControlsSettings({ settings, onChange, profileId });

  return (
    <div className="controls-settings">
      {/* Left column: profile list */}
      <div className={`controls-settings__sidebar ${ctrl.sidebarCollapsed ? 'controls-settings__sidebar--collapsed' : ''}`}>
        <div className="controls-settings__col-header">
          <button
            className="controls-settings__col-toggle"
            onClick={() => ctrl.setSidebarCollapsed(!ctrl.sidebarCollapsed)}
            title={ctrl.sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {ctrl.sidebarCollapsed ? '\u25B6' : '\u25C0'}
          </button>
          <span className="controls-settings__col-title">Profiles</span>
        </div>
        {/* Collapsed: show icon strip for quick profile selection */}
        <div className="controls-settings__sidebar-icons">
          {ctrl.profiles.map((p) => (
            <button
              key={p.id}
              className={`controls-settings__sidebar-icon-btn ${p.id === ctrl.activeProfile?.id ? 'controls-settings__sidebar-icon-btn--active' : ''}`}
              onClick={() => ctrl.selectProfile(p)}
              title={p.name}
            >
              {p.deviceType === 'keyboard' ? '\u2328\uFE0F' : '\uD83C\uDFAE'}
            </button>
          ))}
        </div>
        {/* Expanded: full profile list */}
        <div className="controls-settings__sidebar-content">
          <InputProfileList
            profiles={ctrl.profiles}
            activeId={ctrl.activeProfile?.id ?? null}
            initialEditId={ctrl.newlyCreatedId}
            onSelect={ctrl.selectProfile}
            onDelete={(p) => ctrl.setDeleteTarget(p)}
            onRename={ctrl.handleRename}
            onCreate={ctrl.handleCreate}
          />
        </div>
      </div>

      {/* Center column: tabbed content */}
      <div className="controls-settings__main">
        {/* Tab bar */}
        <div className="controls-settings__tabs">
          <button
            className={`controls-settings__tab ${ctrl.activeTab === 'controls' ? 'controls-settings__tab--active' : ''}`}
            onClick={() => ctrl.setActiveTab('controls')}
          >Game Controls</button>
          <button
            className={`controls-settings__tab ${ctrl.activeTab === 'enhanced' ? 'controls-settings__tab--active' : ''}`}
            onClick={() => ctrl.setActiveTab('enhanced')}
          >Enhanced Controls</button>
          <button
            className={`controls-settings__tab ${ctrl.activeTab === 'shortcuts' ? 'controls-settings__tab--active' : ''}`}
            onClick={() => ctrl.setActiveTab('shortcuts')}
          >Shortcuts &amp; Functions</button>
          <button
            className={`controls-settings__tab ${ctrl.activeTab === 'cheats' ? 'controls-settings__tab--active' : ''}`}
            onClick={() => ctrl.setActiveTab('cheats')}
          >Cheats</button>
        </div>

        {/* Tab content */}
        {ctrl.activeTab === 'controls' && (
          <>
            <div
              className={`controls-settings__bindings ${ctrl.dragOverBindings ? 'controls-settings__bindings--drag-over' : ''}`}
              onDragOver={ctrl.handleDragOver}
              onDragLeave={ctrl.handleDragLeave}
              onDrop={ctrl.handleDrop}
            >
              <div className="controls-settings__section-header">
                Button Mappings
                {ctrl.activeProfile && (
                  <span className="controls-settings__profile-badge">
                    {ctrl.activeProfile.name}
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
                {ctrl.displayMappings.map(mapping => (
                  <BindingRow
                    key={mapping.snesButton}
                    actionLabel={SNES_ACTION_LABELS[mapping.snesButton]}
                    middleLabel={SNES_BUTTON_LABELS[mapping.snesButton]}
                    middleIconUrl={getSnesIconUrl(mapping.snesButton)}
                    binding={mapping.binding}
                    bindingIcon={mapping.icon}
                    onRebind={() => ctrl.handleSnesRebind(mapping.snesButton)}
                    onClear={() => ctrl.handleSnesClear(mapping.snesButton)}
                  />
                ))}
              </div>
            </div>

            {/* Used inputs summary */}
            <div className="controls-settings__used-inputs">
              <div className="controls-settings__used-inputs-header">Required Inputs</div>
              <div className="controls-settings__used-inputs-list">
                {ctrl.requiredInputs.map((input, idx) => (
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

        {ctrl.activeTab === 'enhanced' && (
          <div className="controls-settings__placeholder">
            <p className="controls-settings__placeholder-text">Enhanced controls coming soon.</p>
          </div>
        )}

        {ctrl.activeTab === 'shortcuts' && (
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
              {/* Reserved system shortcut */}
              <div className="binding-row binding-row--reserved" title="Reserved \u2014 cannot be rebound">
                <span className="binding-row__action-label">Open Menu</span>
                <div className="binding-row__icon-slot" />
                <span className="binding-row__snes-label" />
                <div className="binding-row__icon-slot">
                  <img src={getButtonIconUrl('kb-escape')!} alt="Esc" className="binding-row__icon-img" />
                </div>
                <span className="binding-row__binding-label">Esc</span>
              </div>
              {ctrl.displayFunctionMappings
                .filter(m => (SHORTCUT_ACTIONS as readonly string[]).includes(m.action))
                .map(mapping => (
                  <BindingRow
                    key={mapping.action}
                    actionLabel={FUNCTION_ACTION_LABELS[mapping.action]}
                    binding={mapping.binding}
                    bindingIcon={mapping.icon}
                    onRebind={() => ctrl.handleFunctionRebind(mapping.action)}
                    onClear={() => ctrl.handleFunctionClear(mapping.action)}
                  />
                ))}
            </div>
          </div>
        )}

        {ctrl.activeTab === 'cheats' && (
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
              {ctrl.displayFunctionMappings
                .filter(m => (CHEAT_ACTIONS as readonly string[]).includes(m.action))
                .map(mapping => (
                  <BindingRow
                    key={mapping.action}
                    actionLabel={FUNCTION_ACTION_LABELS[mapping.action]}
                    binding={mapping.binding}
                    bindingIcon={mapping.icon}
                    onRebind={() => ctrl.handleFunctionRebind(mapping.action)}
                    onClear={() => ctrl.handleFunctionClear(mapping.action)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Right column: detected devices */}
      <div className={`controls-settings__devices-column ${ctrl.devicesCollapsed ? 'controls-settings__devices-column--collapsed' : ''}`}>
        <div className="controls-settings__col-header">
          <button
            className="controls-settings__col-toggle"
            onClick={() => ctrl.setDevicesCollapsed(!ctrl.devicesCollapsed)}
            title={ctrl.devicesCollapsed ? 'Expand' : 'Collapse'}
          >
            {ctrl.devicesCollapsed ? '\u25C0' : '\u25B6'}
          </button>
          <span className="controls-settings__col-title">Devices</span>
        </div>
        <div className="controls-settings__device-list">
          {ctrl.filteredDevices.map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              onAssign={(d) => {
                if (!d.presetId) return;
                ctrl.setConfirmPreset({
                  presetId: d.presetId,
                  deviceName: d.displayName,
                  vid: d.vendorId ?? '',
                  pid: d.productId ?? '',
                });
              }}
            />
          ))}
          {ctrl.filteredDevices.length === 0 && (
            <p className="controls-settings__no-devices">No devices detected</p>
          )}
        </div>
        <p className="controls-settings__devices-column-expanded controls-settings__device-hint">
          Click controller icon or drag onto bindings to assign.
        </p>
      </div>

      {/* Rebind listener modal */}
      {ctrl.listeningFor && (
        <BindingListener
          actionLabel={
            ctrl.listeningFor.type === 'snes'
              ? SNES_BUTTON_LABELS[ctrl.listeningFor.button]
              : FUNCTION_ACTION_LABELS[ctrl.listeningFor.action]
          }
          onCapture={ctrl.handleCapture}
          onCancel={() => ctrl.setListeningFor(null)}
        />
      )}

      {/* Confirm preset dialog */}
      <Dialog
        open={!!ctrl.confirmPreset}
        title="Apply Controller Preset"
        message={`Assign "${ctrl.confirmPreset?.deviceName ?? ''}" to this profile and apply its default mappings? This will overwrite all current bindings.`}
        confirmLabel="Apply"
        cancelLabel="Cancel"
        onConfirm={ctrl.handleApplyPreset}
        onCancel={() => ctrl.setConfirmPreset(null)}
      />

      {/* Delete profile dialog */}
      <Dialog
        open={!!ctrl.deleteTarget}
        title="Delete Input Profile"
        message={`Delete "${ctrl.deleteTarget?.name ?? ''}"? This cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={ctrl.handleDeleteConfirm}
        onCancel={() => ctrl.setDeleteTarget(null)}
      />
    </div>
  );
}

export { ControlsSettings };