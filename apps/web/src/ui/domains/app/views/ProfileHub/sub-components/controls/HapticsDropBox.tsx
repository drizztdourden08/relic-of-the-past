/* @layer renderer-components @kind component */
/**
 * HapticsDropBox — drop a controller here to enable its haptics. Devices that
 * support vibration are enabled by default and appear as chips; removing a chip
 * mutes that device. Presentational — state lives in useHapticDevices.
 */

import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import type { HapticDeviceChip } from '../controls-settings/useHapticDevices';
import './HapticsDropBox.css';

interface HapticsDropBoxProps {
  chips: HapticDeviceChip[];
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onRemove: (key: string) => void;
}

const HapticsDropBox = (props: HapticsDropBoxProps) => {
  const { chips, dragOver, onDragOver, onDragLeave, onDrop, onRemove } = props;

  return (
    <Box className="haptics-drop-box">
      <Text className="haptics-drop-box__title">Haptics</Text>
      <Box
        className={`haptics-drop-box__zone ${dragOver ? 'haptics-drop-box__zone--drag-over' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {chips.length === 0 ? (
          <Text as="p" className="haptics-drop-box__empty">Drop a controller here to enable rumble.</Text>
        ) : (
          chips.map(chip => (
            <Box key={chip.key} className="haptics-drop-box__chip">
              <Text className="haptics-drop-box__chip-label">{chip.label}</Text>
              <Text
                className="haptics-drop-box__chip-remove"
                title="Mute haptics for this device"
                onClick={() => onRemove(chip.key)}
              >
                ✕
              </Text>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export { HapticsDropBox };
