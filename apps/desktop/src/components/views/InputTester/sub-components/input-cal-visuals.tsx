/* @layer renderer-components @kind component */
/**
 * Visual sub-components for Input Calibration.
 * AxisRecordButton, TriggerBar, StickCircle, and utility helpers.
 */

import { useState, useRef, useCallback } from 'react';
import { getButtonIconUrl } from '../data/button-icons';
import { DEVICE_DATABASE } from '@shared/input/data/devices';
import { findPresetByVidPid } from '@shared/input';

// ── Controller silhouette icons ──
const CONTROLLER_ICON_MAP: Record<string, string> = {
  nintendo: '/buttons/switch/controller_switch_pro.svg',
  xbox: '/buttons/xbox/controller_xboxseries.svg',
  playstation: '/buttons/playstation/controller_playstation5.svg',
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

  const color = done ? '#4ade80' : recording ? '#ef4444' : 'var(--color-text-muted)';

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      title={recording ? 'Stop recording & copy to clipboard' : `Record ${label} axis data`}
      style={{
        width: 18, height: 18, padding: 0, border: 'none', borderRadius: 4,
        background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: recording ? 'axis-rec-flash 0.6s ease-in-out infinite' : undefined,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="6" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="7" cy="7" r="3" fill={color} />
      </svg>
    </button>
  );
};

// ── Trigger Bar Component ──

const TriggerBar = ({ value, label }: { value: number; label: string }) => {
  const clamped = Math.max(0, Math.min(1, value));
  const fillH = clamped * 60; // 60px tall bar
  return (
    <div className="input-cal__stick-container">
      <span className="input-cal__stick-label">{label}</span>
      <div style={{
        width: 24, height: 60, borderRadius: 4,
        border: '1px solid var(--color-border-subtle)',
        background: 'var(--color-bg-secondary, #1a1a2e)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: fillH,
          background: 'var(--color-gold-bright)',
          borderRadius: '0 0 3px 3px',
          transition: 'height 0.05s linear',
        }} />
      </div>
      <span className="input-cal__stick-values">{clamped.toFixed(2)}</span>
    </div>
  );
};

// ── Joystick Circle Component ──

const getStickDirectionIcon = (x: number, y: number, prefix: string): string | null => {
  const threshold = 0.4;
  const ax = Math.abs(x);
  const ay = Math.abs(y);
  if (ax < threshold && ay < threshold) return getButtonIconUrl(prefix);
  if (ax > ay) {
    if (ax > threshold && ay > threshold) return getButtonIconUrl(`${prefix}-horizontal`);
    return getButtonIconUrl(x > 0 ? `${prefix}-right` : `${prefix}-left`);
  } else {
    if (ax > threshold && ay > threshold) return getButtonIconUrl(`${prefix}-vertical`);
    return getButtonIconUrl(y > 0 ? `${prefix}-down` : `${prefix}-up`);
  }
};

const StickCircle = ({ x, y, label, iconPrefix }: { x: number; y: number; label: string; iconPrefix?: string }) => {
  const clampX = Math.max(-1, Math.min(1, x));
  const clampY = Math.max(-1, Math.min(1, y));
  const dotX = 40 + clampX * 36;
  const dotY = 40 + clampY * 36;

  return (
    <div className="input-cal__stick-container">
      <span className="input-cal__stick-label">{label}</span>
      <div className="input-cal__stick-circle">
        <svg width="80" height="80" style={{ position: 'absolute', top: 0, left: 0 }}>
          <line x1="0" y1="40" x2="80" y2="40" stroke="var(--color-border-subtle)" strokeWidth="1" />
          <line x1="40" y1="0" x2="40" y2="80" stroke="var(--color-border-subtle)" strokeWidth="1" />
          <line x1="40" y1="40" x2={dotX} y2={dotY} stroke="var(--color-gold-base)" strokeWidth="2" strokeLinecap="round" />
          <circle cx={dotX} cy={dotY} r="5" fill="var(--color-gold-bright)" />
        </svg>
      </div>
      <span className="input-cal__stick-values">
        {clampX.toFixed(2)}, {clampY.toFixed(2)}
      </span>
      {iconPrefix && (() => {
        const iconUrl = getStickDirectionIcon(clampX, clampY, iconPrefix);
        return iconUrl ? (
          <img src={iconUrl} alt="" draggable={false} style={{ width: 32, height: 32, marginTop: 2, opacity: 0.85 }} />
        ) : null;
      })()}
    </div>
  );
};

const resolveDeviceName = (vid: string, pid: string, hidProduct?: string): string => {
  const vidPid = `${vid.padStart(4, '0')}:${pid.padStart(4, '0')}`;
  const sdlEntry = DEVICE_DATABASE.find(e => e.vidPid === vidPid);
  if (sdlEntry) return sdlEntry.name;
  const preset = findPresetByVidPid(vid, pid);
  if (preset && preset.id !== 'generic') return preset.name;
  return hidProduct || `HID ${vidPid}`;
};

export { AxisRecordButton, CONTROLLER_ICON_MAP, StickCircle, TriggerBar, resolveDeviceName };
