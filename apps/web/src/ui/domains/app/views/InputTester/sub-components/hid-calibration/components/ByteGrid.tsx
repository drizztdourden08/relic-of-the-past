/* @layer renderer-components @kind data */
/**
 * Live byte grid visualization for the HID Calibration Wizard.
 */
import type { CSSProperties } from 'react';
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../../design-system/primitives/Text';
import type { ByteStatus, GyroState } from '../hid-calibration.type';
import { hex } from '../hid-analysis';
import type { ByteColorResult } from '../wizard-helpers';

// Categorical data-viz swatch colors (fixed hues that ENCODE byte roles, not theme colors).
const SWATCH: Record<string, CSSProperties> = {
  unknown: { background: '#4a5568' },
  excluded: { background: '#555' },
  stick: { background: '#38bdf8' },
  trigger: { background: '#fb923c' },
  button: { background: '#4ade80' },
  changed: { background: '#fbbf24' },
  gyro: { background: '#f87171' },
  selected: { background: '#c084fc' },
};

interface ByteGridProps {
  latestBytes: Uint8Array;
  byteStatuses: ByteStatus[];
  gyroState: GyroState;
  stickPickMode: boolean;
  stickPickedBytes: number[];
  triggerPickMode: boolean;
  triggerPickedByte: number | null;
  inputPhaseActive: boolean;
  lastReportId: number;
  baselineRef: React.MutableRefObject<Uint8Array>;
  excludedRef: React.MutableRefObject<Set<number>>;
  itemsRef: React.MutableRefObject<{ id: string; label: string; status: string }[]>;
  activeIdxRef: React.MutableRefObject<number>;
  inputPhaseActiveRef: React.MutableRefObject<boolean>;
  getByteColor: (idx: number) => ByteColorResult;
  onByteClick: (idx: number) => void;
}

const ByteGrid = (props: ByteGridProps) => {
  const {
    latestBytes, byteStatuses, gyroState, stickPickMode, stickPickedBytes,
    triggerPickMode, triggerPickedByte, lastReportId,
    baselineRef, excludedRef, itemsRef, activeIdxRef, inputPhaseActiveRef,
    getByteColor, onByteClick,
  } = props;

  return (
    <Box className="hid-cal__step">
      <Box className="hid-cal__step-title">Live Bytes — Report 0x{lastReportId.toString(16)}</Box>
      <Box className="hid-cal__byte-grid">
        {Array.from(latestBytes).map((b, i) => {
          const colors = getByteColor(i);
          const isChanged = baselineRef.current.length > i && baselineRef.current[i] !== b && !excludedRef.current.has(i);
          const isPicked = (stickPickMode && stickPickedBytes.includes(i)) || (triggerPickMode && triggerPickedByte === i);
          const pickHighlight = (stickPickMode || triggerPickMode) && !isPicked;
          const activeItem = itemsRef.current[activeIdxRef.current];
          return (
            <Box key={i} className="hid-cal__byte-box" style={{
              background: isPicked ? '#1a1a3d' : isChanged ? '#332200' : colors.bg,
              borderColor: isPicked ? '#c084fc' : isChanged ? '#fbbf24' : colors.border,
              color: isPicked ? '#c084fc' : isChanged ? '#fbbf24' : colors.text,
              cursor: 'pointer',
              boxShadow: isPicked ? '0 0 6px #c084fc88' : undefined,
              opacity: pickHighlight && excludedRef.current.has(i) ? 0.4 : 1,
            }} title={stickPickMode
              ? `byte[${i}] — click to ${isPicked ? 'deselect' : 'select'} as stick axis`
              : triggerPickMode
              ? `byte[${i}] — click to ${isPicked ? 'deselect' : 'select'} as trigger axis`
              : (inputPhaseActiveRef.current && activeItem?.status === 'active'
                ? `byte[${i}] = 0x${hex(b)} (${b}) — click to assign to "${activeItem?.label}"`
                : `byte[${i}] = 0x${hex(b)} (${b}) — ${byteStatuses[i] ?? 'unknown'}\nClick to toggle exclusion`)}
              onClick={() => onByteClick(i)}>
              <Text className="hid-cal__byte-idx">{i}</Text>
              <Text className="hid-cal__byte-val">{hex(b)}</Text>
            </Box>
          );
        })}
      </Box>
      {latestBytes.length === 0 && <Box className="hid-cal__desc">Waiting for HID reports...</Box>}
      <Box className="hid-cal__byte-legend">
        <Text><Text className="hid-cal__legend-swatch" style={SWATCH.unknown} /> Unknown</Text>
        <Text><Text className="hid-cal__legend-swatch" style={SWATCH.excluded} /> Excluded</Text>
        <Text><Text className="hid-cal__legend-swatch" style={SWATCH.stick} /> Stick</Text>
        <Text><Text className="hid-cal__legend-swatch" style={SWATCH.trigger} /> Trigger</Text>
        <Text><Text className="hid-cal__legend-swatch" style={SWATCH.button} /> Button</Text>
        <Text><Text className="hid-cal__legend-swatch" style={SWATCH.changed} /> Changed</Text>
        {gyroState === 'recording' && (
          <Text><Text className="hid-cal__legend-swatch" style={SWATCH.gyro} /> Gyro</Text>
        )}
        {stickPickMode && (
          <Text><Text className="hid-cal__legend-swatch" style={SWATCH.selected} /> Selected</Text>
        )}
        {triggerPickMode && (
          <Text><Text className="hid-cal__legend-swatch" style={SWATCH.selected} /> Selected</Text>
        )}
      </Box>
    </Box>
  );
};

export { ByteGrid };
