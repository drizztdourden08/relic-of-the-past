/* @layer renderer-components @kind component */
import { SegmentedControl, Slider, Box, Text } from '../../../../design-system/primitives';
import { MODE_OPTIONS } from './TrackerView.constants';
import type { PanelHeaderProps } from './TrackerView.type';

const PanelHeader = ({ title, panelSettings, onSettingsChange, onClose, onPopOut, onDock, showPopOut, onMouseDown }: PanelHeaderProps) => {
  const modeValue = panelSettings.mode === 'floating' ? 'float' : panelSettings.side;

  return (
    <Box className="tracker-panel__header" onMouseDown={onMouseDown}>
      <Text className="tracker-panel__title">{title}</Text>
      <Box className="tracker-panel__controls">
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
          <Box as="button" className="tracker-panel__icon-btn" onClick={onPopOut} title="Pop out">⎋</Box>
        )}
        {onDock && (
          <Box as="button" className="tracker-panel__icon-btn" onClick={onDock} title="Dock back">⎌</Box>
        )}
        <Box as="button" className="tracker-panel__icon-btn" onClick={onClose} title="Close">×</Box>
      </Box>
    </Box>
  );
};

export { PanelHeader };
