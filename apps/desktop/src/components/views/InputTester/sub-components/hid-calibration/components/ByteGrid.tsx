/**
 * Live byte grid visualization for the HID Calibration Wizard.
 */
import type { ByteStatus, GyroState } from '../types';
import { hex } from '../hid-analysis';
import type { ByteColorResult } from '../wizard-helpers';

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
    <div className="hid-cal__step">
      <div className="hid-cal__step-title">Live Bytes — Report 0x{lastReportId.toString(16)}</div>
      <div className="hid-cal__byte-grid">
        {Array.from(latestBytes).map((b, i) => {
          const colors = getByteColor(i);
          const isChanged = baselineRef.current.length > i && baselineRef.current[i] !== b && !excludedRef.current.has(i);
          const isPicked = (stickPickMode && stickPickedBytes.includes(i)) || (triggerPickMode && triggerPickedByte === i);
          const pickHighlight = (stickPickMode || triggerPickMode) && !isPicked;
          const activeItem = itemsRef.current[activeIdxRef.current];
          return (
            <div key={i} className="hid-cal__byte-box" style={{
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
              <span className="hid-cal__byte-idx">{i}</span>
              <span className="hid-cal__byte-val">{hex(b)}</span>
            </div>
          );
        })}
      </div>
      {latestBytes.length === 0 && <div className="hid-cal__desc">Waiting for HID reports...</div>}
      <div className="hid-cal__byte-legend">
        <span><span className="hid-cal__legend-swatch" style={{ background: '#4a5568' }} /> Unknown</span>
        <span><span className="hid-cal__legend-swatch" style={{ background: '#555' }} /> Excluded</span>
        <span><span className="hid-cal__legend-swatch" style={{ background: '#38bdf8' }} /> Stick</span>
        <span><span className="hid-cal__legend-swatch" style={{ background: '#fb923c' }} /> Trigger</span>
        <span><span className="hid-cal__legend-swatch" style={{ background: '#4ade80' }} /> Button</span>
        <span><span className="hid-cal__legend-swatch" style={{ background: '#fbbf24' }} /> Changed</span>
        {gyroState === 'recording' && (
          <span><span className="hid-cal__legend-swatch" style={{ background: '#f87171' }} /> Gyro</span>
        )}
        {stickPickMode && (
          <span><span className="hid-cal__legend-swatch" style={{ background: '#c084fc' }} /> Selected</span>
        )}
        {triggerPickMode && (
          <span><span className="hid-cal__legend-swatch" style={{ background: '#c084fc' }} /> Selected</span>
        )}
      </div>
    </div>
  );
};

export { ByteGrid };
