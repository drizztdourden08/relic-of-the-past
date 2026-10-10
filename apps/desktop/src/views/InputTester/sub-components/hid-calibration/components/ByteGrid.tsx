/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { hex } from '../hid-analysis';
import { ByteChangeDot } from './ByteChangeDot';
import { rampColor } from './ramp-color';
import type { ByteGridProps } from './ByteGrid.type';

const swatch: Record<string, CSSProperties> = {
  unknown: { background: '#4a5568' },
  excluded: { background: '#555' },
  stick: { background: '#38bdf8' },
  trigger: { background: '#fb923c' },
  button: { background: '#4ade80' },
  changed: { background: `linear-gradient(90deg, ${rampColor(0)}, ${rampColor(0.5)}, ${rampColor(1)})` },
  gyro: { background: '#f87171' },
  selected: { background: '#c084fc' },
};

const ByteGrid = (props: ByteGridProps) => {
  const {
    latestBytes, byteStatuses, gyroState, stickPickMode, stickPickedBytes,
    triggerPickMode, triggerPickedByte, lastReportId,
    baselineRef, excludedRef, itemsRef, activeIdxRef, inputPhaseActiveRef,
    getByteColor, onByteClick,
  } = props;

  return (
    <Box className="hid-cal__step">
      <Box className="hid-cal__step-title">Live Bytes for report 0x{lastReportId.toString(16)}</Box>
      <Box className="hid-cal__byte-grid">
        {Array.from(latestBytes).map((b, i) => {
          const colors = getByteColor(i);
          const base = baselineRef.current[i];
          const delta = base !== undefined && !excludedRef.current.has(i) ? b - base : 0;
          const signed = byteStatuses[i] === 'stick' || byteStatuses[i] === 'trigger';
          const isPicked = (stickPickMode && stickPickedBytes.includes(i)) || (triggerPickMode && triggerPickedByte === i);
          const pickHighlight = (stickPickMode || triggerPickMode) && !isPicked;
          const activeItem = itemsRef.current[activeIdxRef.current];
          return (
            <Box key={i} className="hid-cal__byte-box" style={{
              background: isPicked ? '#1a1a3d' : colors.bg,
              borderColor: isPicked ? '#c084fc' : colors.border,
              color: isPicked ? '#c084fc' : colors.text,
              cursor: 'pointer',
              boxShadow: isPicked ? '0 0 6px #c084fc88' : undefined,
              opacity: pickHighlight && excludedRef.current.has(i) ? 0.4 : 1,
            }} title={stickPickMode
              ? `byte[${i}], click to ${isPicked ? 'deselect' : 'select'} as stick axis`
              : triggerPickMode
              ? `byte[${i}], click to ${isPicked ? 'deselect' : 'select'} as trigger axis`
              : (inputPhaseActiveRef.current && activeItem?.status === 'active'
                ? `byte[${i}] = 0x${hex(b)} (${b}), click to assign to "${activeItem?.label}"`
                : `byte[${i}] = 0x${hex(b)} (${b}) is ${byteStatuses[i] ?? 'unknown'}\nClick to toggle exclusion`)}
              onClick={() => onByteClick(i)}>
              <ByteChangeDot delta={delta} signed={signed} />
              <Text className="hid-cal__byte-idx">{i}</Text>
              <Text className="hid-cal__byte-val">{hex(b)}</Text>
            </Box>
          );
        })}
      </Box>
      {latestBytes.length === 0 && <Box className="hid-cal__desc">Waiting for HID reports...</Box>}
      <Box className="hid-cal__byte-legend">
        <Text><Text className="hid-cal__legend-swatch" style={swatch.unknown} /> Unknown</Text>
        <Text><Text className="hid-cal__legend-swatch" style={swatch.excluded} /> Excluded</Text>
        <Text><Text className="hid-cal__legend-swatch" style={swatch.stick} /> Stick</Text>
        <Text><Text className="hid-cal__legend-swatch" style={swatch.trigger} /> Trigger</Text>
        <Text><Text className="hid-cal__legend-swatch" style={swatch.button} /> Button</Text>
        <Text><Text className="hid-cal__legend-swatch" style={swatch.changed} /> Changed (top edge, by amount)</Text>
        {gyroState === 'recording' && (
          <Text><Text className="hid-cal__legend-swatch" style={swatch.gyro} /> Gyro</Text>
        )}
        {stickPickMode && (
          <Text><Text className="hid-cal__legend-swatch" style={swatch.selected} /> Selected</Text>
        )}
        {triggerPickMode && (
          <Text><Text className="hid-cal__legend-swatch" style={swatch.selected} /> Selected</Text>
        )}
      </Box>
    </Box>
  );
};

export { ByteGrid };
