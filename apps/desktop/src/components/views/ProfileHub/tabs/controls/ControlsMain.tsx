/* @layer renderer-components @kind component */
/** ControlsSettings center column: tabbed binding editor (controls/enhanced/shortcuts/cheats). */
import {
  SNES_ACTION_LABELS,
  SNES_BUTTON_LABELS,
  SHORTCUT_ACTIONS,
  CHEAT_ACTIONS,
  FUNCTION_ACTION_LABELS,
} from '@shared/types/controls';
import { BindingRow } from './BindingRow';
import { getSnesIconUrl, getButtonIconUrl } from '../../../InputTester/data/button-icons';
import type { useControlsSettings } from '../useControlsSettings';

type Ctrl = ReturnType<typeof useControlsSettings>;

const ControlsMain = ({ ctrl }: { ctrl: Ctrl }) => {
  return (
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
            <div className="binding-row binding-row--reserved" title="Reserved — cannot be rebound">
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
  );
};

export { ControlsMain };
