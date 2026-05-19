import { SegmentedControl, Slider } from '../../primitives';
import { MODE_OPTIONS } from './constants';
import type { PanelHeaderProps } from './types';

function PanelHeader({ title, panelSettings, onSettingsChange, onClose, onPopOut, onDock, showPopOut, onMouseDown }: PanelHeaderProps) {
  const modeValue = panelSettings.mode === 'floating' ? 'float' : panelSettings.side;

  return (
    <div className="tracker-panel__header" onMouseDown={onMouseDown}>
      <span className="tracker-panel__title">{title}</span>
      <div className="tracker-panel__controls">
        <SegmentedControl
          value={modeValue}
          options={MODE_OPTIONS}
          onChange={(v) => {
            if (v === 'float') onSettingsChange(s => ({ ...s, mode: 'floating' }));
            else onSettingsChange(s => ({ ...s, mode: 'docked', side: v }));
          }}
        />
        <Slider
          value={Math.round(panelSettings.opacity * 100)}
          min={20}
          max={100}
          step={5}
          onChange={(v) => onSettingsChange(s => ({ ...s, opacity: v / 100 }))}
          showValue={false}
        />
        {showPopOut && onPopOut && (
          <button className="tracker-panel__icon-btn" onClick={onPopOut} title="Pop out">⎋</button>
        )}
        {onDock && (
          <button className="tracker-panel__icon-btn" onClick={onDock} title="Dock back">⎌</button>
        )}
        <button className="tracker-panel__icon-btn" onClick={onClose} title="Close">×</button>
      </div>
    </div>
  );
}

export { PanelHeader };
