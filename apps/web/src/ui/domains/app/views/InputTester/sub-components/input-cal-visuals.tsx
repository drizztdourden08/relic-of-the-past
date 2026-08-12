/* @layer renderer-components @kind component */
/**
 * Visual sub-components for Input Calibration.
 * AxisRecordButton, TriggerBar, StickCircle, and utility helpers.
 */

import { useState, useRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Button } from '../../../../../design-system/primitives/Button';
import { Text } from '../../../../../design-system/primitives/Text';
import { Image } from '../../../../../design-system/primitives/Image';
import { Svg, SvgLine, SvgCircle } from '../../../../../design-system/primitives/Svg';
import { getButtonIconUrl } from '@app/lib/input/button-icons';
import { publicAsset } from '@app/lib/assets/public-asset';
import { resolveStickDirectionIcon } from '@shared/input/family';

// Static inline-style literals (dynamic/animated styles stay inline).
const VIS_STYLES: Record<string, CSSProperties> = {
  triggerTrack: { width: 24, height: 60, borderRadius: 4, border: '1px solid var(--c-border)', background: 'var(--c-surface)', position: 'relative', overflow: 'hidden' },
  svgAbs: { position: 'absolute', top: 0, left: 0 },
  dirIcon: { width: 32, height: 32, marginTop: 2, opacity: 0.85 },
};

// ── Controller silhouette icons ──
const CONTROLLER_ICON_MAP: Record<string, string> = {
  nintendo: publicAsset('buttons/switch/controller_switch_pro.svg'),
  xbox: publicAsset('buttons/xbox/controller_xboxseries.svg'),
  playstation: publicAsset('buttons/playstation/controller_playstation5.svg'),
};

// ── Axis Record Button ──

const AxisRecordButton = ({ getValues, label }: { getValues: () => number[]; label: string }) => {
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const bufRef = useRef<{ t: number; v: number[] }[]>([]);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const getValRef = useRef(getValues);
  getValRef.current = getValues;

  const startRecording = useCallback(() => {
    bufRef.current = [];
    startRef.current = performance.now();
    setRecording(true);
    setDone(false);
    const sample = () => {
      bufRef.current.push({ t: Math.round(performance.now() - startRef.current), v: getValRef.current() });
      rafRef.current = requestAnimationFrame(sample);
    };
    rafRef.current = requestAnimationFrame(sample);
  }, []);

  const stopRecording = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setRecording(false);
    const data = { label, samples: bufRef.current.length, durationMs: bufRef.current.length > 0 ? bufRef.current[bufRef.current.length - 1].t : 0, values: bufRef.current };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  }, [label]);

  const color = done ? 'var(--c-green-bright)' : recording ? 'var(--c-danger)' : 'var(--c-text-muted)';

  return (
    <Button
      variant="bare"
      onClick={recording ? stopRecording : startRecording}
      title={recording ? 'Stop recording & copy to clipboard' : `Record ${label} axis data`}
      style={{
        width: 18, height: 18, padding: 0, border: 'none', borderRadius: 4,
        background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: recording ? 'axis-rec-flash 0.6s ease-in-out infinite' : undefined,
      }}
    >
      <Svg width="14" height="14" viewBox="0 0 14 14">
        <SvgCircle cx="7" cy="7" r="6" fill="none" stroke={color} strokeWidth="1.5" />
        <SvgCircle cx="7" cy="7" r="3" fill={color} />
      </Svg>
    </Button>
  );
};

// ── Trigger Bar Component ──

/** `pressed` mirrors resolveLiveControlState's threshold read for the same
 *  trigger. A full press highlights the track exactly like a pressed button
 *  cell does, so a trigger reads as working both as an axis and as a
 *  button, with no second cell needed in the button grid. */
const TriggerBar = ({ value, label, pressed }: { value: number; label: string; pressed?: boolean }) => {
  const clamped = Math.max(0, Math.min(1, value));
  const fillH = clamped * 60; // 60px tall bar
  const track: CSSProperties = {
    ...VIS_STYLES.triggerTrack,
    border: pressed ? '1px solid var(--c-green-bright)' : '1px solid var(--c-border)',
    boxShadow: pressed ? '0 0 0 1px var(--c-green-bright)' : 'none',
  };
  return (
    <Box className="input-cal__stick-container">
      <Text className="input-cal__stick-label">{label}</Text>
      <Box style={track}>
        <Box style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: fillH,
          background: pressed ? 'var(--c-green-bright)' : 'var(--c-gold-bright)',
          borderRadius: '0 0 3px 3px',
          transition: 'height 0.05s linear',
        }} />
      </Box>
      <Text className="input-cal__stick-values">{clamped.toFixed(2)}</Text>
    </Box>
  );
};

// ── Joystick Circle Component ──

const StickCircle = ({ x, y, label, iconPrefix }: { x: number; y: number; label: string; iconPrefix?: string }) => {
  const clampX = Math.max(-1, Math.min(1, x));
  const clampY = Math.max(-1, Math.min(1, y));
  const dotX = 40 + clampX * 36;
  const dotY = 40 + clampY * 36;

  return (
    <Box className="input-cal__stick-container">
      <Text className="input-cal__stick-label">{label}</Text>
      <Box className="input-cal__stick-circle">
        <Svg width="80" height="80" style={VIS_STYLES.svgAbs}>
          <SvgLine x1="0" y1="40" x2="80" y2="40" stroke="var(--c-border)" strokeWidth="1" />
          <SvgLine x1="40" y1="0" x2="40" y2="80" stroke="var(--c-border)" strokeWidth="1" />
          <SvgLine x1="40" y1="40" x2={dotX} y2={dotY} stroke="var(--c-gold)" strokeWidth="2" strokeLinecap="round" />
          <SvgCircle cx={dotX} cy={dotY} r="5" fill="var(--c-gold-bright)" />
        </Svg>
      </Box>
      <Text className="input-cal__stick-values">
        {clampX.toFixed(2)}, {clampY.toFixed(2)}
      </Text>
      {iconPrefix && (() => {
        const iconUrl = getButtonIconUrl(resolveStickDirectionIcon(iconPrefix, clampX, clampY));
        return iconUrl ? (
          <Image src={iconUrl} alt="" draggable={false} style={VIS_STYLES.dirIcon} />
        ) : null;
      })()}
    </Box>
  );
};

export { AxisRecordButton, CONTROLLER_ICON_MAP, StickCircle, TriggerBar };
