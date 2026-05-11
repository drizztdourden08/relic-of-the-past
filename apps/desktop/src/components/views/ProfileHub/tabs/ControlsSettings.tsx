import { SettingsSection } from '../../../composites/SettingsSection';

export function ControlsSettings() {
  return (
    <div className="settings-tab">
      <SettingsSection title="Keyboard Controls">
        <div className="controls-placeholder">
          <p className="controls-placeholder__text">
            Keybinding configuration coming soon.
          </p>
          <table className="controls-placeholder__table">
            <tbody>
              <tr><td>D-Pad</td><td>Arrow Keys</td></tr>
              <tr><td>A (Action)</td><td>S</td></tr>
              <tr><td>B (Sword)</td><td>X</td></tr>
              <tr><td>X (Map)</td><td>A</td></tr>
              <tr><td>Y (Item)</td><td>Z</td></tr>
              <tr><td>L / R</td><td>D / C</td></tr>
              <tr><td>Start</td><td>Enter</td></tr>
              <tr><td>Select</td><td>Right Shift</td></tr>
            </tbody>
          </table>
        </div>
      </SettingsSection>
    </div>
  );
}
