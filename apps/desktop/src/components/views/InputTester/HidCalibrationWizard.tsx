/**
 * HID Calibration Wizard v6 — enhanced byte-level visualization.
 *
 * Flow:
 *  1. Select profile → immediately opens live view
 *  2. GYRO: manual toggle — user clicks Start, moves controller, clicks Stop.
 *     All bytes that changed are marked as excluded and highlighted.
 *  3. IDLE: one-click snapshot captures baseline state.
 *  4. STICKS: rotate each stick in full circle → auto-detect 2 bytes with largest range.
 *  5. BUTTONS: auto-detect presses using only non-excluded bytes.
 *
 * Always-on features:
 *  - Live byte grid showing all bytes with index labels, color-coded by status.
 *  - Copy to JSON always available (partial or full).
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { webHidReader } from '../../../lib/input/hid-reader';
import type { WebHidRawReport } from '../../../lib/input/hid-reader';
import {
  DEVICE_PROFILES,
  findDeviceProfileByVidPid,
} from '@shared/input';
import type { DeviceProfile } from '@shared/input';
import { DEVICE_DATABASE } from '@shared/input/device-database';
import type { DeviceDatabaseEntry } from '@shared/input/device-database';
import { Select } from '../../primitives';
import type { SelectOption } from '../../primitives';

// ── Exported types ─────────────────────────────────────────────────────────────

export interface HidButtonMapping {
  byteIndex: number;
  bitMask: number;
  /** For analog triggers: value above which the button is considered pressed */
  threshold?: number;
  /** For analog triggers: resting value of the byte */
  restValue?: number;
}

export interface HidAxisMapping {
  byteIndex: number; center: number;
  min: number; max: number; inverted: boolean;
}

export interface IdleByteAnalysis {
  byteIndex: number; min: number; max: number; range: number;
  average: number; uniqueCount: number; uniqueValues: number[] | string;
}

export interface IdleRecordResult {
  label: string; durationMs: number; frameCount: number;
  bytes: IdleByteAnalysis[];
}

export interface HidControllerMap {
  name: string; profileId: string;
  vendorId: number; productId: number;
  reportId: number; reportLength: number;
  buttons: Record<string, HidButtonMapping>;
  axes: Record<string, HidAxisMapping>;
  excludedBytes: number[];
  idleData?: Record<string, IdleRecordResult>;
  createdAt: number;
}

// ── Internal types ─────────────────────────────────────────────────────────────

type Phase = 'select-profile' | 'live';
type CaptureState = 'waiting-press' | 'confirming-press' | 'waiting-release';
type AxisSubStep = 'pos' | 'neg';
type InputStatus = 'pending' | 'active' | 'captured' | 'skipped';
type StickSide = 'left' | 'right';
type GyroState = 'idle' | 'recording' | 'done';
type IdleState = 'idle' | 'done';

interface InputItem {
  kind: 'button' | 'axis'; id: string; label: string;
  category: string; status: InputStatus;
  result?: string; mapping?: HidButtonMapping; axisMapping?: HidAxisMapping;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const hex = (b: number) => b.toString(16).padStart(2, '0');
const popcount = (n: number) => { let c = 0; let v = n; while (v) { c += v & 1; v >>>= 1; } return c; };
const STICK_IDS = new Set(['leftX', 'leftY', 'rightX', 'rightY']);
const TRIGGER_IDS = new Set(['leftTrigger', 'rightTrigger']);
type TriggerSide = 'left' | 'right';

/** Minimum byte delta to consider a change "analog" rather than digital */
const ANALOG_THRESHOLD_DELTA = 30;

interface ButtonDiff {
  byteIndex: number; bitMask: number;
  analog: boolean; restValue: number; pressedValue: number;
}

function findButtonBits(bl: Uint8Array, pressed: Uint8Array, excluded: Set<number>): ButtonDiff[] {
  const out: ButtonDiff[] = [];
  for (let i = 0; i < Math.min(bl.length, pressed.length); i++) {
    if (excluded.has(i)) continue;
    const xor = bl[i] ^ pressed[i];
    if (!xor) continue;
    const delta = Math.abs(pressed[i] - bl[i]);
    // Analog: large delta with many bits changing (analog trigger ramp)
    const isAnalog = delta >= ANALOG_THRESHOLD_DELTA && popcount(xor) > 3;
    out.push({ byteIndex: i, bitMask: xor, analog: isAnalog, restValue: bl[i], pressedValue: pressed[i] });
  }
  return out;
}

function findAxisBytes(bl: Uint8Array, s: Uint8Array, excluded: Set<number>, minDelta = 30) {
  const out: { byteIndex: number; baseVal: number; sampleVal: number }[] = [];
  for (let i = 0; i < Math.min(bl.length, s.length); i++) {
    if (excluded.has(i)) continue;
    if (Math.abs(s[i] - bl[i]) >= minDelta) {
      out.push({ byteIndex: i, baseVal: bl[i], sampleVal: s[i] });
    }
  }
  return out;
}

function findCounterBytes(reports: Uint8Array[]): Set<number> {
  const counters = new Set<number>();
  if (reports.length < 10) return counters;
  const len = reports[0].length;
  for (let i = 0; i < len; i++) {
    let changes = 0;
    let smallDeltas = 0;
    for (let r = 1; r < reports.length; r++) {
      if (reports[r][i] !== reports[r - 1][i]) {
        changes++;
        // Check if delta is small (counter-like: +1, +2, or wrapping)
        const d = (reports[r][i] - reports[r - 1][i] + 256) % 256;
        if (d <= 3 || d >= 253) smallDeltas++;
      }
    }
    const total = reports.length - 1;
    // Counter: changes frequently AND most deltas are tiny increments
    if (changes / total > 0.7 && smallDeltas / Math.max(changes, 1) > 0.6) {
      counters.add(i);
    }
  }
  return counters;
}

interface StickCandidate { idx: number; range: number; min: number; max: number; center: number; }

const STICK_RANGE_THRESHOLD = 60;
const STICK_STABLE_FRAMES = 8;
const CONFIRM_FRAMES = 5;

const AXIS_LABELS: Record<string, { pos: string; neg: string }> = {
  leftX:  { pos: 'Push LEFT stick fully RIGHT',  neg: 'Push LEFT stick fully LEFT' },
  leftY:  { pos: 'Push LEFT stick fully DOWN',   neg: 'Push LEFT stick fully UP' },
  rightX: { pos: 'Push RIGHT stick fully RIGHT', neg: 'Push RIGHT stick fully LEFT' },
  rightY: { pos: 'Push RIGHT stick fully DOWN',  neg: 'Push RIGHT stick fully UP' },
};

const TRIGGER_RANGE_THRESHOLD = 40;
const TRIGGER_STABLE_FRAMES = 6;

// ── Byte status for visualization ──────────────────────────────────────────────

type ByteStatus = 'unknown' | 'gyro' | 'counter' | 'stick' | 'trigger' | 'button' | 'idle';

// ── Component ──────────────────────────────────────────────────────────────────

interface Props {
  onComplete: (map: HidControllerMap) => void;
  onCancel: () => void;
  /** Filter raw reports to only this device (prevents cross-device interference) */
  deviceKey?: string;
}

export function HidCalibrationWizard({ onComplete, onCancel, deviceKey }: Props): JSX.Element {
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedSdlVidPid, setSelectedSdlVidPid] = useState('');
  const [hasGyro, setHasGyro] = useState(true); // default true until proven otherwise
  const [profile, setProfile] = useState<DeviceProfile | null>(null);
  const [phase, setPhase] = useState<Phase>('select-profile');

  // Gyro & idle state
  const [gyroState, setGyroState] = useState<GyroState>('idle');
  const [idleState, setIdleState] = useState<IdleState>('idle');
  const [gyroExcluded, setGyroExcluded] = useState<Set<number>>(new Set());

  // Stick state — each stick is independent
  const [activeStick, setActiveStick] = useState<StickSide | null>(null);
  const [stickBusy, setStickBusy] = useState(false);
  const [stickLiveInfo, setStickLiveInfo] = useState('');
  const [stickPickMode, setStickPickMode] = useState(false);
  const [stickPickedBytes, setStickPickedBytes] = useState<number[]>([]);

  // Trigger state — each trigger is independent
  const [activeTrigger, setActiveTrigger] = useState<TriggerSide | null>(null);
  const [triggerBusy, setTriggerBusy] = useState(false);
  const [triggerLiveInfo, setTriggerLiveInfo] = useState('');
  const [triggerPickMode, setTriggerPickMode] = useState(false);
  const [triggerPickedByte, setTriggerPickedByte] = useState<number | null>(null);

  // Button/axis capture state
  const [items, _setItems] = useState<InputItem[]>([]);
  const [activeIndex, _setActiveIndex] = useState(-1);
  const [captureState, _setCaptureState] = useState<CaptureState>('waiting-press');
  const [axisSubStep, _setAxisSubStep] = useState<AxisSubStep>('pos');
  const [inputPhaseActive, setInputPhaseActive] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // Live report
  const [latestBytes, setLatestBytes] = useState<Uint8Array>(new Uint8Array(0));

  // Byte status tracking
  const [byteStatuses, setByteStatuses] = useState<ByteStatus[]>([]);
  const [gyroChangedBytes, setGyroChangedBytes] = useState<Set<number>>(new Set());

  // Log
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  // Refs for real-time detection
  const activeIdxRef = useRef(-1);
  const captureStateRef = useRef<CaptureState>('waiting-press');
  const axisSubStepRef = useRef<AxisSubStep>('pos');
  const itemsRef = useRef<InputItem[]>([]);
  const releaseCountRef = useRef(0);
  const detectedBtnRef = useRef<HidButtonMapping | null>(null);
  const confirmCountRef = useRef(0);
  const axisCapRef = useRef<Record<string, { posBytes: Uint8Array | null; negBytes: Uint8Array | null }>>({});
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvanceRef = useRef(false);
  const lastReportIdRef = useRef(0);
  const inputPhaseActiveRef = useRef(false);

  const baselineRef = useRef(new Uint8Array(0));
  const excludedRef = useRef(new Set<number>());
  const deviceInfoRef = useRef({ vendorId: 0, productId: 0, reportId: 0, reportLength: 0 });

  // Gyro recording refs
  const gyroRecordingRef = useRef(false);
  const gyroMinsRef = useRef<Uint8Array>(new Uint8Array(0));
  const gyroMaxsRef = useRef<Uint8Array>(new Uint8Array(0));
  const gyroBufferRef = useRef<Uint8Array[]>([]);

  // Stick refs
  const stickRecordingRef = useRef(false);
  const stickMinsRef = useRef<Uint8Array>(new Uint8Array(0));
  const stickMaxsRef = useRef<Uint8Array>(new Uint8Array(0));
  const stickCounterBytesRef = useRef(new Set<number>());
  const stickSamplesRef = useRef(0);
  const stickStableCountRef = useRef(0);
  const stickLastTop2Ref = useRef('');
  const activeStickRef = useRef<StickSide | null>(null);
  const stickBufferRef = useRef<Uint8Array[]>([]);
  const capturedStickBytesRef = useRef(new Set<number>());
  const leftStickBytesRef = useRef(new Set<number>());
  const rightStickBytesRef = useRef(new Set<number>());
  const finalizeStickRef = useRef<(c1: StickCandidate, c2: StickCandidate | null) => void>(() => {});

  // Trigger refs
  const triggerRecordingRef = useRef(false);
  const triggerMinsRef = useRef<Uint8Array>(new Uint8Array(0));
  const triggerMaxsRef = useRef<Uint8Array>(new Uint8Array(0));
  const triggerSamplesRef = useRef(0);
  const triggerStableCountRef = useRef(0);
  const triggerLastTopRef = useRef('');
  const activeTriggerRef = useRef<TriggerSide | null>(null);
  const triggerBufferRef = useRef<Uint8Array[]>([]);
  const capturedTriggerBytesRef = useRef(new Set<number>());
  const leftTriggerByteRef = useRef<number | null>(null);
  const rightTriggerByteRef = useRef<number | null>(null);
  const finalizeTriggerRef = useRef<(c: StickCandidate) => void>(() => {});

  // Byte statuses ref
  const byteStatusesRef = useRef<ByteStatus[]>([]);

  // Idle byte recording for mapped axes
  const [idleRecording, setIdleRecording] = useState<string | null>(null); // axis label being recorded
  const [idleResults, setIdleResults] = useState<Record<string, IdleRecordResult>>({}); // label → result
  const idleRecordBufRef = useRef<{ byteIndices: number[]; frames: number[][] }>({ byteIndices: [], frames: [] });
  const idleRecordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestBytesRef = useRef<Uint8Array>(new Uint8Array(0));
  // Keep ref in sync
  useEffect(() => { latestBytesRef.current = latestBytes; }, [latestBytes]);

  // Synced setters
  const setActiveIndex = (i: number) => { activeIdxRef.current = i; _setActiveIndex(i); };
  const setCaptureState = (s: CaptureState) => { captureStateRef.current = s; _setCaptureState(s); };
  const setAxisSubStep = (s: AxisSubStep) => { axisSubStepRef.current = s; _setAxisSubStep(s); };
  const setItems: typeof _setItems = (u) => {
    _setItems(prev => {
      const next = typeof u === 'function' ? u(prev) : u;
      itemsRef.current = next;
      return next;
    });
  };
  const setInputPhaseActiveWrapped = (v: boolean) => { inputPhaseActiveRef.current = v; setInputPhaseActive(v); };
  const setAutoAdvanceWrapped = (v: boolean) => { autoAdvanceRef.current = v; setAutoAdvance(v); };

  const addLog = useCallback((msg: string) => setLog(prev => [...prev.slice(-199), msg]), []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);

  const handleIdleRecord = useCallback((label: string, byteIndices: number[]) => {
    setIdleRecording(label);
    idleRecordBufRef.current = { byteIndices, frames: [] };
    addLog(`Recording idle bytes [${byteIndices.join(',')}] for ${label}...`);

    const sample = () => {
      const bytes = latestBytesRef.current;
      if (bytes.length > 0) {
        idleRecordBufRef.current.frames.push(byteIndices.map(i => bytes[i] ?? 0));
      }
    };
    const iv = setInterval(sample, 8);

    idleRecordTimerRef.current = setTimeout(() => {
      clearInterval(iv);
      const { frames, byteIndices: idxs } = idleRecordBufRef.current;
      if (frames.length === 0) { setIdleRecording(null); return; }

      const analysis = idxs.map((byteIdx, col) => {
        const values = frames.map(f => f[col]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const unique = [...new Set(values)].sort((a, b) => a - b);
        const avg = values.reduce((s, v) => s + v, 0) / values.length;
        return {
          byteIndex: byteIdx,
          min, max, range: max - min,
          average: Math.round(avg),
          uniqueCount: unique.length,
          uniqueValues: unique.length <= 32 ? unique : `${unique.length} values`,
        };
      });

      const out: IdleRecordResult = { label, durationMs: 3000, frameCount: frames.length, bytes: analysis };
      setIdleResults(prev => ({ ...prev, [label]: out }));
      navigator.clipboard.writeText(JSON.stringify(out, null, 2));
      addLog(`✓ Idle recorded for ${label}: ${frames.length} frames. Copied to clipboard.`);
      setIdleRecording(null);
    }, 3000);
  }, [addLog]);

  // ── Auto-detect from connected device ──
  useEffect(() => {
    const keys = webHidReader.getConnectedDeviceKeys();
    if (keys.length === 0) return;
    const [vid, pid] = keys[0].split(':');
    const vidPid = `${vid}:${pid}`;

    // Match SDL database for gyro info
    const sdlMatch = DEVICE_DATABASE.find(e => e.vidPid === vidPid);
    if (sdlMatch) {
      setSelectedSdlVidPid(vidPid);
      setHasGyro(sdlMatch.hasGyro);
      addLog(`SDL match: ${sdlMatch.name} (${vidPid})${sdlMatch.hasGyro ? ' [gyro]' : ''}`);
    } else {
      addLog(`No SDL match for ${vidPid} — pick manually or use Generic`);
    }

    // Match calibration profile
    const profileMatch = findDeviceProfileByVidPid(vid, pid);
    if (profileMatch) {
      setSelectedProfileId(profileMatch.id);
      addLog(`Auto-detected profile: ${profileMatch.name} (${vid}:${pid})`);
    } else {
      addLog(`No profile for ${vid}:${pid} — select from SDL list or use Generic`);
    }
  }, [addLog]);

  // ── SDL controller options for searchable picker ──
  const sdlOptions: SelectOption[] = useMemo(() =>
    DEVICE_DATABASE
      .filter(e => e.vidPid)
      .map(e => ({
        value: e.vidPid!,
        label: `${e.name} (${e.vidPid})${e.hasGyro ? ' 🔄' : ''}`,
      })),
    []
  );

  // ── Update hasGyro + auto-resolve profile when SDL selection changes ──
  const handleSdlSelect = useCallback((vidPid: string) => {
    setSelectedSdlVidPid(vidPid);
    const entry = DEVICE_DATABASE.find(e => e.vidPid === vidPid);
    if (entry) setHasGyro(entry.hasGyro);

    // Auto-resolve calibration profile from SDL VID:PID
    if (vidPid) {
      const [vid, pid] = vidPid.split(':');
      const profileMatch = findDeviceProfileByVidPid(vid, pid);
      if (profileMatch) setSelectedProfileId(profileMatch.id);
    }
  }, []);

  // ── Update byte statuses ──
  const updateByteStatuses = useCallback((len: number) => {
    const statuses: ByteStatus[] = new Array(len).fill('unknown');
    for (const i of excludedRef.current) {
      if (i < len) statuses[i] = 'gyro';
    }
    // Mark stick bytes blue (overrides gyro)
    for (const i of capturedStickBytesRef.current) {
      if (i < len) statuses[i] = 'stick';
    }
    // Mark trigger bytes
    for (const i of capturedTriggerBytesRef.current) {
      if (i < len) statuses[i] = 'trigger';
    }
    for (const item of itemsRef.current) {
      if (item.mapping && item.status === 'captured') {
        const bi = item.mapping.byteIndex;
        if (bi < len) statuses[bi] = 'button';
      }
    }
    byteStatusesRef.current = statuses;
    setByteStatuses([...statuses]);
  }, []);

  // ── Advance to next button input ──
  const doAdvance = useCallback(() => {
    const curItems = itemsRef.current;
    let nextIdx = activeIdxRef.current + 1;
    while (nextIdx < curItems.length) {
      const it = curItems[nextIdx];
      if (STICK_IDS.has(it.id) || TRIGGER_IDS.has(it.id)) { nextIdx++; continue; }
      if (it.status !== 'captured' && it.status !== 'skipped') break;
      nextIdx++;
    }
    if (nextIdx >= curItems.length) {
      setInputPhaseActiveWrapped(false);
      addLog('All inputs mapped!');
      return;
    }
    setActiveIndex(nextIdx);
    setCaptureState('waiting-press');
    setAxisSubStep('pos');
    releaseCountRef.current = 0;
    confirmCountRef.current = 0;
    detectedBtnRef.current = null;
    setItems(prev => prev.map((it, i) =>
      i === nextIdx ? { ...it, status: 'active' } : it
    ));
  }, [addLog]);

  // ── Raw report subscription ──
  useEffect(() => {
    if (phase !== 'live') return;

    const unsub = webHidReader.onRawReport((report) => {
      // Skip reports from other devices when deviceKey filter is active
      if (deviceKey && report.deviceKey !== deviceKey) return;

      const bytes = new Uint8Array(report.bytes);
      setLatestBytes(bytes);
      lastReportIdRef.current = report.reportId;

      if (byteStatusesRef.current.length === 0 && bytes.length > 0) {
        updateByteStatuses(bytes.length);
      }

      const keys = webHidReader.getConnectedDeviceKeys();
      if (keys.length > 0 && deviceInfoRef.current.vendorId === 0) {
        const targetKey = deviceKey ?? keys[0];
        const [vidH, pidH] = targetKey.split(':');
        deviceInfoRef.current.vendorId = parseInt(vidH, 16);
        deviceInfoRef.current.productId = parseInt(pidH, 16);
      }
      deviceInfoRef.current.reportId = report.reportId;
      deviceInfoRef.current.reportLength = bytes.length;

      // ── GYRO RECORDING ──
      if (gyroRecordingRef.current) {
        const len = bytes.length;
        const mins = gyroMinsRef.current;
        const maxs = gyroMaxsRef.current;
        for (let i = 0; i < len; i++) {
          if (bytes[i] < mins[i]) mins[i] = bytes[i];
          if (bytes[i] > maxs[i]) maxs[i] = bytes[i];
        }
        gyroBufferRef.current.push(new Uint8Array(bytes));
        if (gyroBufferRef.current.length > 200) gyroBufferRef.current.shift();

        if (gyroBufferRef.current.length % 5 === 0) {
          const changed = new Set<number>();
          for (let i = 0; i < len; i++) {
            if (maxs[i] !== mins[i]) changed.add(i);
          }
          setGyroChangedBytes(new Set(changed));
        }
        return;
      }

      // ── STICK CIRCLE ──
      if (stickRecordingRef.current) {
        const len = bytes.length;
        const mins = stickMinsRef.current;
        const maxs = stickMaxsRef.current;
        for (let i = 0; i < len; i++) {
          if (bytes[i] < mins[i]) mins[i] = bytes[i];
          if (bytes[i] > maxs[i]) maxs[i] = bytes[i];
        }
        stickSamplesRef.current++;
        stickBufferRef.current.push(new Uint8Array(bytes));
        if (stickBufferRef.current.length > 60) stickBufferRef.current.shift();

        if (stickSamplesRef.current % 5 === 0) {
          if (stickBufferRef.current.length >= 20) {
            stickCounterBytesRef.current = findCounterBytes(stickBufferRef.current);
          }
          const ctrBytes = stickCounterBytesRef.current;
          const candidates: StickCandidate[] = [];
          const prevStickBytes = capturedStickBytesRef.current;
          for (let i = 0; i < len; i++) {
            if (prevStickBytes.has(i)) continue;
            if (excludedRef.current.has(i)) continue;
            const range = maxs[i] - mins[i];
            if (ctrBytes.has(i)) continue;
            if (range >= 20) {
              candidates.push({ idx: i, range, min: mins[i], max: maxs[i], center: baselineRef.current[i] ?? 128 });
            }
          }
          candidates.sort((a, b) => b.range - a.range);
          const top2 = candidates.slice(0, 2);

          if (top2.length >= 2) {
            setStickLiveInfo(`byte[${top2[0].idx}] range=${top2[0].range}  |  byte[${top2[1].idx}] range=${top2[1].range}`);
          } else if (top2.length === 1) {
            setStickLiveInfo(`byte[${top2[0].idx}] range=${top2[0].range}  |  waiting for 2nd axis...`);
          } else {
            setStickLiveInfo('No candidates yet — keep rotating...');
          }

          const key = top2.map(c => `${c.idx}`).join(',');
          if (key === stickLastTop2Ref.current) {
            stickStableCountRef.current++;
          } else {
            stickStableCountRef.current = 0;
            stickLastTop2Ref.current = key;
          }

          // Finalize with 2 candidates if both above threshold
          if (top2.length >= 2 && top2[0].range >= STICK_RANGE_THRESHOLD && top2[1].range >= STICK_RANGE_THRESHOLD
              && stickStableCountRef.current >= STICK_STABLE_FRAMES) {
            stickRecordingRef.current = false;
            setStickBusy(false);
            finalizeStickRef.current(top2[0], top2[1]);
          }
        }
        return;
      }

      // ── TRIGGER RECORDING ──
      if (triggerRecordingRef.current) {
        const len = bytes.length;
        const mins = triggerMinsRef.current;
        const maxs = triggerMaxsRef.current;
        for (let i = 0; i < len; i++) {
          if (bytes[i] < mins[i]) mins[i] = bytes[i];
          if (bytes[i] > maxs[i]) maxs[i] = bytes[i];
        }
        triggerSamplesRef.current++;
        triggerBufferRef.current.push(new Uint8Array(bytes));
        if (triggerBufferRef.current.length > 40) triggerBufferRef.current.shift();

        if (triggerSamplesRef.current % 5 === 0) {
          const candidates: StickCandidate[] = [];
          const prevStickBytes = capturedStickBytesRef.current;
          const prevTriggerBytes = capturedTriggerBytesRef.current;
          for (let i = 0; i < len; i++) {
            if (prevStickBytes.has(i)) continue;
            if (prevTriggerBytes.has(i)) continue;
            if (excludedRef.current.has(i)) continue;
            const range = maxs[i] - mins[i];
            if (range >= 15) {
              candidates.push({ idx: i, range, min: mins[i], max: maxs[i], center: baselineRef.current[i] ?? 0 });
            }
          }
          candidates.sort((a, b) => b.range - a.range);
          const top1 = candidates[0] ?? null;

          if (top1) {
            setTriggerLiveInfo(`byte[${top1.idx}] range=${top1.range} (${top1.min}..${top1.max})`);
          } else {
            setTriggerLiveInfo('No candidates yet — press and release the trigger...');
          }

          const key = top1 ? `${top1.idx}` : '';
          if (key === triggerLastTopRef.current) {
            triggerStableCountRef.current++;
          } else {
            triggerStableCountRef.current = 0;
            triggerLastTopRef.current = key;
          }

          if (top1 && top1.range >= TRIGGER_RANGE_THRESHOLD
              && triggerStableCountRef.current >= TRIGGER_STABLE_FRAMES) {
            triggerRecordingRef.current = false;
            setTriggerBusy(false);
            finalizeTriggerRef.current(top1);
          }
        }
        return;
      }

      // ── BUTTON/AXIS DETECTION ──
      if (!inputPhaseActiveRef.current) return;

      const idx = activeIdxRef.current;
      const item = itemsRef.current[idx];
      if (!item) return;
      if ((item.status === 'captured' || item.status === 'skipped') && captureStateRef.current !== 'waiting-release') return;

      const bl = baselineRef.current;
      const excl = excludedRef.current;

      if (captureStateRef.current === 'waiting-press') {
        releaseCountRef.current = 0;
        confirmCountRef.current = 0;
        detectedBtnRef.current = null;

        if (item.kind === 'button') {
          const diffs = findButtonBits(bl, bytes, excl);
          if (diffs.length > 0) {
            // Prefer clean digital (fewest bits) but accept analog
            const digital = diffs.filter(d => !d.analog);
            const analog = diffs.filter(d => d.analog);
            let best: ButtonDiff;
            if (digital.length > 0) {
              best = digital[0];
              for (const d of digital) { if (popcount(d.bitMask) < popcount(best.bitMask)) best = d; }
            } else {
              // All candidates are analog — pick largest delta
              best = analog[0];
              for (const d of analog) {
                if (Math.abs(d.pressedValue - d.restValue) > Math.abs(best.pressedValue - best.restValue)) best = d;
              }
            }
            if (best.analog) {
              const threshold = best.restValue + Math.floor(Math.abs(best.pressedValue - best.restValue) / 3);
              detectedBtnRef.current = { byteIndex: best.byteIndex, bitMask: 0xFF, threshold, restValue: best.restValue };
            } else {
              detectedBtnRef.current = { byteIndex: best.byteIndex, bitMask: best.bitMask };
            }
            confirmCountRef.current = 1;
            setCaptureState('confirming-press');
          }
        }
        if (item.kind === 'axis') {
          const diffs = findAxisBytes(bl, bytes, excl, 30);
          if (diffs.length > 0) {
            detectedBtnRef.current = { byteIndex: diffs[0].byteIndex, bitMask: 0 };
            confirmCountRef.current = 1;
            setCaptureState('confirming-press');
          }
        }
        return;
      }

      if (captureStateRef.current === 'confirming-press') {
        if (item.kind === 'button') {
          const prev = detectedBtnRef.current;
          let stillHeld = false;
          if (prev && prev.threshold != null) {
            // Analog: check if value still exceeds threshold
            const val = bytes[prev.byteIndex];
            stillHeld = Math.abs(val - (prev.restValue ?? bl[prev.byteIndex])) >= ANALOG_THRESHOLD_DELTA;
          } else if (prev) {
            // Digital: check exact bitmask
            const diffs = findButtonBits(bl, bytes, excl);
            stillHeld = diffs.some(d => d.byteIndex === prev.byteIndex && d.bitMask === prev.bitMask);
          }
          if (stillHeld) {
            confirmCountRef.current++;
            if (confirmCountRef.current >= CONFIRM_FRAMES) {
              const isAnalog = prev!.threshold != null;
              const result = isAnalog
                ? `byte[${prev!.byteIndex}] analog (rest=${prev!.restValue}, threshold=${prev!.threshold})`
                : `byte[${prev!.byteIndex}] & 0x${hex(prev!.bitMask)}`;
              addLog(`✓ ${item.label}: ${result}`);
              setItems(prev2 => prev2.map((it, i) =>
                i === idx ? { ...it, status: 'captured', result, mapping: prev! } : it
              ));
              setCaptureState('waiting-release');
              updateByteStatuses(bytes.length);
            }
          } else {
            confirmCountRef.current = 0;
            detectedBtnRef.current = null;
            setCaptureState('waiting-press');
          }
        }
        if (item.kind === 'axis') {
          const diffs = findAxisBytes(bl, bytes, excl, 30);
          if (diffs.length > 0) {
            confirmCountRef.current++;
            if (confirmCountRef.current >= CONFIRM_FRAMES) {
              const axisId = item.id;
              if (!axisCapRef.current[axisId]) axisCapRef.current[axisId] = { posBytes: null, negBytes: null };
              const sub = axisSubStepRef.current;
              if (sub === 'pos') {
                axisCapRef.current[axisId].posBytes = new Uint8Array(bytes);
                addLog(`✓ ${item.label}+ — ${diffs.map(d => `[${d.byteIndex}]:${d.baseVal}→${d.sampleVal}`).join(', ')}`);
              } else {
                axisCapRef.current[axisId].negBytes = new Uint8Array(bytes);
                addLog(`✓ ${item.label}− — ${diffs.map(d => `[${d.byteIndex}]:${d.baseVal}→${d.sampleVal}`).join(', ')}`);
              }
              setCaptureState('waiting-release');
            }
          } else {
            confirmCountRef.current = 0;
            detectedBtnRef.current = null;
            setCaptureState('waiting-press');
          }
        }
        return;
      }

      if (captureStateRef.current === 'waiting-release') {
        let released = false;
        if (item.kind === 'button') {
          const m = detectedBtnRef.current;
          if (m && m.threshold != null) {
            // Analog: released when value returns near rest
            const val = bytes[m.byteIndex];
            released = Math.abs(val - (m.restValue ?? bl[m.byteIndex])) < ANALOG_THRESHOLD_DELTA / 2;
          } else if (m) {
            released = (bytes[m.byteIndex] & m.bitMask) === (bl[m.byteIndex] & m.bitMask);
          }
        } else {
          released = findAxisBytes(bl, bytes, excl, 10).length === 0;
        }
        if (released) {
          releaseCountRef.current++;
          if (releaseCountRef.current >= 3) {
            if (item.kind === 'button') {
              if (autoAdvanceRef.current) {
                if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
                advanceTimerRef.current = setTimeout(() => doAdvance(), 150);
              } else {
                // Manual mode: stay on this item, stop listening
                setCaptureState('waiting-press');
              }
            } else {
              const sub = axisSubStepRef.current;
              if (sub === 'pos') {
                setAxisSubStep('neg');
                setCaptureState('waiting-press');
                releaseCountRef.current = 0;
              } else {
                const ac = axisCapRef.current[item.id];
                if (ac?.posBytes && ac?.negBytes) {
                  const posD = findAxisBytes(bl, ac.posBytes, excl, 5);
                  const negD = findAxisBytes(bl, ac.negBytes, excl, 5);
                  const allB = new Set([...posD.map(d => d.byteIndex), ...negD.map(d => d.byteIndex)]);
                  let bestByte = -1, bestRange = 0;
                  for (const bi of allB) {
                    const r = Math.abs(ac.posBytes[bi] - ac.negBytes[bi]);
                    if (r > bestRange) { bestRange = r; bestByte = bi; }
                  }
                  if (bestByte >= 0) {
                    const posVal = ac.posBytes[bestByte], negVal = ac.negBytes[bestByte];
                    const centerVal = bl[bestByte];
                    const inverted = posVal < negVal;
                    const axisMapping: HidAxisMapping = {
                      byteIndex: bestByte, center: centerVal,
                      min: Math.min(posVal, negVal), max: Math.max(posVal, negVal), inverted,
                    };
                    const result = `byte[${bestByte}] ${axisMapping.min}..${centerVal}..${axisMapping.max}${inverted ? ' inv' : ''}`;
                    addLog(`✓ ${item.label}: ${result}`);
                    setItems(prev => prev.map((it, i) =>
                      i === idx ? { ...it, status: 'captured', result, axisMapping } : it
                    ));
                    updateByteStatuses(bytes.length);
                  } else {
                    addLog(`⚠ No axis data for ${item.label}`);
                    setItems(prev => prev.map((it, i) =>
                      i === idx ? { ...it, status: 'skipped', result: 'no data' } : it
                    ));
                  }
                }
                if (autoAdvanceRef.current) {
                  if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
                  advanceTimerRef.current = setTimeout(() => doAdvance(), 150);
                } else {
                  setCaptureState('waiting-press');
                }
              }
            }
          }
        } else {
          releaseCountRef.current = 0;
        }
      }
    });

    return () => {
      unsub();
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, [phase, addLog, doAdvance, updateByteStatuses, deviceKey]);

  // ── Profile confirm ──
  const handleProfileConfirm = useCallback(() => {
    const p = DEVICE_PROFILES.find(pr => pr.id === selectedProfileId);
    if (!p) return;
    setProfile(p);

    const stickItems = p.axes.filter(a => STICK_IDS.has(a.id))
      .map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    const triggerItems = p.axes.filter(a => TRIGGER_IDS.has(a.id))
      .map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    const buttonItems = p.buttons
      .map(b => ({ kind: 'button' as const, id: b.id, label: b.label, category: b.category, status: 'pending' as const }));
    const otherAxisItems = p.axes.filter(a => !STICK_IDS.has(a.id) && !TRIGGER_IDS.has(a.id))
      .map(a => ({ kind: 'axis' as const, id: a.id, label: a.label, category: a.category, status: 'pending' as const }));
    setItems([...stickItems, ...triggerItems, ...buttonItems, ...otherAxisItems]);
    setPhase('live');
    addLog(`Calibrating ${p.name} — ${stickItems.length + triggerItems.length + buttonItems.length + otherAxisItems.length} inputs`);
  }, [selectedProfileId, addLog]);

  // ── GYRO ──
  const handleGyroStart = useCallback(() => {
    const len = latestBytes.length || 64;
    gyroMinsRef.current = new Uint8Array(len).fill(255);
    gyroMaxsRef.current = new Uint8Array(len).fill(0);
    gyroBufferRef.current = [];
    gyroRecordingRef.current = true;
    setGyroState('recording');
    setGyroChangedBytes(new Set());
    addLog('Gyro recording started — tilt, rotate, shake the controller...');
  }, [latestBytes.length, addLog]);

  const handleGyroStop = useCallback(() => {
    gyroRecordingRef.current = false;
    const len = gyroMinsRef.current.length;
    const excl = new Set<number>();
    for (let i = 0; i < len; i++) {
      if (gyroMaxsRef.current[i] !== gyroMinsRef.current[i]) excl.add(i);
    }
    const counters = findCounterBytes(gyroBufferRef.current);
    for (const c of counters) excl.add(c);

    excludedRef.current = excl;
    setGyroExcluded(new Set(excl));
    setGyroState('done');
    addLog(`✓ Gyro done: ${excl.size} bytes excluded (${counters.size} counters, ${excl.size - counters.size} gyro/accel)`);
    updateByteStatuses(len);
  }, [addLog, updateByteStatuses]);

  const handleGyroRedo = useCallback(() => {
    setGyroState('idle');
    setGyroChangedBytes(new Set());
    excludedRef.current = new Set();
    setGyroExcluded(new Set());
    addLog('Gyro data cleared — ready to re-record.');
    if (latestBytes.length > 0) updateByteStatuses(latestBytes.length);
  }, [addLog, latestBytes.length, updateByteStatuses]);

  // ── IDLE ──
  const handleIdleCapture = useCallback(() => {
    if (latestBytes.length === 0) { addLog('⚠ No reports received yet'); return; }
    baselineRef.current = new Uint8Array(latestBytes);
    setIdleState('done');
    addLog(`✓ Idle baseline captured: ${latestBytes.length} bytes`);
  }, [latestBytes, addLog]);

  const handleIdleRedo = useCallback(() => {
    baselineRef.current = new Uint8Array(0);
    setIdleState('idle');
    addLog('Idle baseline cleared.');
  }, [addLog]);

  const prereqsDone = (hasGyro ? gyroState === 'done' : true) && idleState === 'done';

  // ── Finalize stick ──
  const finalizeStick = useCallback((c1: StickCandidate, c2: StickCandidate | null) => {
    const side = activeStickRef.current ?? 'left';
    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    const xId = side === 'left' ? 'leftX' : 'rightX';
    const yId = side === 'left' ? 'leftY' : 'rightY';

    const x = c2 ? (c1.idx < c2.idx ? c1 : c2) : c1;
    const y = c2 ? (c1.idx < c2.idx ? c2 : c1) : null;

    const xMapping: HidAxisMapping = { byteIndex: x.idx, center: x.center, min: x.min, max: x.max, inverted: false };
    const xResult = `byte[${x.idx}] ${x.min}..${x.center}..${x.max} (range ${x.range})`;
    addLog(`✓ ${label} X: ${xResult}`);

    let yMapping: HidAxisMapping | null = null;
    let yResult = 'skipped (single byte)';
    if (y) {
      yMapping = { byteIndex: y.idx, center: y.center, min: y.min, max: y.max, inverted: false };
      yResult = `byte[${y.idx}] ${y.min}..${y.center}..${y.max} (range ${y.range})`;
      addLog(`✓ ${label} Y: ${yResult}`);
    } else {
      addLog(`  ${label} Y: skipped (single byte stick)`);
    }

    const mins = stickMinsRef.current;
    const maxs = stickMaxsRef.current;
    const ctrBytes = stickCounterBytesRef.current;
    const sideBytes = side === 'left' ? leftStickBytesRef : rightStickBytesRef;
    const otherSideBytes = side === 'left' ? rightStickBytesRef : leftStickBytesRef;
    sideBytes.current = new Set();
    const stickExcluded: number[] = [];

    // Always exclude the explicitly picked/detected axis bytes
    const explicitBytes = new Set<number>();
    explicitBytes.add(x.idx);
    if (y) explicitBytes.add(y.idx);
    for (const bi of explicitBytes) {
      excludedRef.current.add(bi);
      capturedStickBytesRef.current.add(bi);
      sideBytes.current.add(bi);
      stickExcluded.push(bi);
    }

    // Also exclude any other bytes that moved during stick circle recording
    for (let i = 0; i < mins.length; i++) {
      if (explicitBytes.has(i)) continue;          // already handled above
      if (ctrBytes.has(i)) continue;
      if (gyroExcluded.has(i)) continue;          // don't claim gyro bytes
      if (otherSideBytes.current.has(i)) continue; // don't claim other stick's bytes
      const range = maxs[i] - mins[i];
      if (range >= 3) {
        excludedRef.current.add(i);
        capturedStickBytesRef.current.add(i);
        sideBytes.current.add(i);
        stickExcluded.push(i);
      }
    }
    setGyroExcluded(new Set(excludedRef.current));
    addLog(`  Excluded ${stickExcluded.length} bytes for ${label} stick: [${stickExcluded.join(', ')}]`);

    setItems(prev => prev.map(it => {
      if (it.id === xId) return { ...it, status: 'captured' as InputStatus, result: xResult, axisMapping: xMapping };
      if (it.id === yId) return { ...it, status: (yMapping ? 'captured' : 'skipped') as InputStatus, result: yResult, axisMapping: yMapping ?? undefined };
      return it;
    }));

    setActiveStick(null);
    activeStickRef.current = null;
    setStickBusy(false);
    setStickLiveInfo('');
    addLog(`${label} stick calibration done.`);
    updateByteStatuses(mins.length);
  }, [addLog, updateByteStatuses, gyroExcluded]);

  finalizeStickRef.current = finalizeStick;

  // ── Start stick circle ──
  const handleStartCircle = useCallback((side: StickSide) => {
    activeStickRef.current = side;
    setActiveStick(side);

    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    const len = baselineRef.current.length;
    stickMinsRef.current = new Uint8Array(len).fill(255);
    stickMaxsRef.current = new Uint8Array(len).fill(0);
    stickCounterBytesRef.current = new Set();
    stickSamplesRef.current = 0;
    stickStableCountRef.current = 0;
    stickLastTop2Ref.current = '';
    stickBufferRef.current = [];
    stickRecordingRef.current = true;
    setStickBusy(true);
    setStickLiveInfo('Rotate the stick slowly...');
    addLog(`Recording ${label} stick — rotate slowly in a full circle.`);
  }, [addLog]);

  const handleStopCircle = useCallback(() => {
    stickRecordingRef.current = false;
    setStickBusy(false);
    setActiveStick(null);
    activeStickRef.current = null;
    setStickLiveInfo('');
    addLog('Stopped recording.');
  }, [addLog]);

  const handleSkipStick = useCallback((side: StickSide) => {
    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    const xId = side === 'left' ? 'leftX' : 'rightX';
    const yId = side === 'left' ? 'leftY' : 'rightY';
    addLog(`Skipped ${label} stick`);
    setItems(prev => prev.map(it => {
      if (it.id === xId || it.id === yId) return { ...it, status: 'skipped', result: 'skipped' };
      return it;
    }));
  }, [addLog]);

  const handleStickRedo = useCallback((side: StickSide) => {
    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    const xId = side === 'left' ? 'leftX' : 'rightX';
    const yId = side === 'left' ? 'leftY' : 'rightY';
    const sideBytes = side === 'left' ? leftStickBytesRef : rightStickBytesRef;
    // Only remove this stick's bytes from excluded
    for (const b of sideBytes.current) {
      excludedRef.current.delete(b);
      capturedStickBytesRef.current.delete(b);
    }
    sideBytes.current = new Set();
    setGyroExcluded(new Set(excludedRef.current));
    setItems(prev => prev.map(it =>
      (it.id === xId || it.id === yId) ? { ...it, status: 'pending' as InputStatus, result: undefined, axisMapping: undefined } : it
    ));
    stickRecordingRef.current = false;
    setStickBusy(false);
    setStickPickMode(false);
    setStickPickedBytes([]);
    setStickLiveInfo('');
    setActiveStick(null);
    activeStickRef.current = null;
    if (latestBytes.length > 0) updateByteStatuses(latestBytes.length);
    addLog(`${label} stick reset — ready to redo.`);
  }, [addLog, latestBytes.length, updateByteStatuses]);

  // ── Manual stick byte picking ──
  const handleStickPickMode = useCallback((side: StickSide) => {
    stickRecordingRef.current = false;
    setStickBusy(false);
    activeStickRef.current = side;
    setActiveStick(side);
    setStickPickMode(true);
    setStickPickedBytes([]);
    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    addLog(`Manual pick mode: click 1 or 2 byte boxes for ${label} stick, then Confirm.`);
  }, [addLog]);

  const handleStickBytePicked = useCallback((idx: number) => {
    setStickPickedBytes(prev => {
      if (prev.includes(idx)) {
        addLog(`byte[${idx}] deselected`);
        return prev.filter(b => b !== idx);
      }
      if (prev.length >= 2) return prev;
      const next = [...prev, idx];
      addLog(`byte[${idx}] selected as stick ${next.length === 1 ? 'X' : 'Y'}`);
      return next;
    });
  }, [addLog]);

  const handleConfirmPick = useCallback(() => {
    if (stickPickedBytes.length === 0) return;
    const bl = baselineRef.current;
    const mins = stickMinsRef.current;
    const maxs = stickMaxsRef.current;
    const bytes = latestBytes;
    const makeCand = (i: number): StickCandidate => ({
      idx: i,
      range: mins.length > i ? maxs[i] - mins[i] : 0,
      min: mins.length > i ? mins[i] : 0,
      max: maxs.length > i ? maxs[i] : 255,
      center: bl.length > i ? bl[i] : (bytes.length > i ? bytes[i] : 128),
    });
    const c1 = makeCand(stickPickedBytes[0]);
    const c2 = stickPickedBytes.length >= 2 ? makeCand(stickPickedBytes[1]) : null;
    setStickPickMode(false);
    setStickPickedBytes([]);
    finalizeStickRef.current(c1, c2);
  }, [stickPickedBytes, latestBytes]);

  const handleCancelPick = useCallback(() => {
    setStickPickMode(false);
    setStickPickedBytes([]);
    addLog('Pick mode cancelled.');
  }, [addLog]);

  // ── Finalize trigger ──
  const finalizeTrigger = useCallback((c: StickCandidate) => {
    const side = activeTriggerRef.current ?? 'left';
    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';

    const mapping: HidAxisMapping = { byteIndex: c.idx, center: c.center, min: c.min, max: c.max, inverted: false };
    const result = `byte[${c.idx}] ${c.min}..${c.center}..${c.max} (range ${c.range})`;
    addLog(`✓ ${label} Trigger: ${result}`);

    // Exclude the trigger byte
    excludedRef.current.add(c.idx);
    capturedTriggerBytesRef.current.add(c.idx);
    if (side === 'left') leftTriggerByteRef.current = c.idx;
    else rightTriggerByteRef.current = c.idx;

    setGyroExcluded(new Set(excludedRef.current));

    setItems(prev => prev.map(it =>
      it.id === axisId ? { ...it, status: 'captured' as InputStatus, result, axisMapping: mapping } : it
    ));

    setActiveTrigger(null);
    activeTriggerRef.current = null;
    setTriggerBusy(false);
    setTriggerLiveInfo('');
    addLog(`${label} trigger calibration done.`);
    updateByteStatuses(baselineRef.current.length);
  }, [addLog, updateByteStatuses]);

  finalizeTriggerRef.current = finalizeTrigger;

  // ── Start trigger recording ──
  const handleStartTrigger = useCallback((side: TriggerSide) => {
    activeTriggerRef.current = side;
    setActiveTrigger(side);

    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    const len = baselineRef.current.length;
    triggerMinsRef.current = new Uint8Array(len).fill(255);
    triggerMaxsRef.current = new Uint8Array(len).fill(0);
    triggerSamplesRef.current = 0;
    triggerStableCountRef.current = 0;
    triggerLastTopRef.current = '';
    triggerBufferRef.current = [];
    triggerRecordingRef.current = true;
    setTriggerBusy(true);
    setTriggerLiveInfo('Press the trigger fully and release...');
    addLog(`Recording ${label} trigger — press fully and release a few times.`);
  }, [addLog]);

  const handleStopTrigger = useCallback(() => {
    triggerRecordingRef.current = false;
    setTriggerBusy(false);
    setActiveTrigger(null);
    activeTriggerRef.current = null;
    setTriggerLiveInfo('');
    addLog('Stopped trigger recording.');
  }, [addLog]);

  const handleSkipTrigger = useCallback((side: TriggerSide) => {
    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';
    addLog(`Skipped ${label} trigger`);
    setItems(prev => prev.map(it =>
      it.id === axisId ? { ...it, status: 'skipped', result: 'skipped' } : it
    ));
  }, [addLog]);

  const handleTriggerRedo = useCallback((side: TriggerSide) => {
    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';
    const prevByte = side === 'left' ? leftTriggerByteRef.current : rightTriggerByteRef.current;
    if (prevByte !== null) {
      excludedRef.current.delete(prevByte);
      capturedTriggerBytesRef.current.delete(prevByte);
    }
    if (side === 'left') leftTriggerByteRef.current = null;
    else rightTriggerByteRef.current = null;
    setGyroExcluded(new Set(excludedRef.current));
    setItems(prev => prev.map(it =>
      it.id === axisId ? { ...it, status: 'pending' as InputStatus, result: undefined, axisMapping: undefined } : it
    ));
    triggerRecordingRef.current = false;
    setTriggerBusy(false);
    setTriggerPickMode(false);
    setTriggerPickedByte(null);
    setTriggerLiveInfo('');
    setActiveTrigger(null);
    activeTriggerRef.current = null;
    if (latestBytes.length > 0) updateByteStatuses(latestBytes.length);
    addLog(`${label} trigger reset — ready to redo.`);
  }, [addLog, latestBytes.length, updateByteStatuses]);

  // ── Manual trigger byte picking ──
  const handleTriggerPickMode = useCallback((side: TriggerSide) => {
    triggerRecordingRef.current = false;
    setTriggerBusy(false);
    activeTriggerRef.current = side;
    setActiveTrigger(side);
    setTriggerPickMode(true);
    setTriggerPickedByte(null);
    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    addLog(`Manual pick mode: click 1 byte box for ${label} trigger, then Confirm.`);
  }, [addLog]);

  const handleTriggerBytePicked = useCallback((idx: number) => {
    setTriggerPickedByte(prev => {
      if (prev === idx) {
        addLog(`byte[${idx}] deselected`);
        return null;
      }
      addLog(`byte[${idx}] selected as trigger`);
      return idx;
    });
  }, [addLog]);

  const handleConfirmTriggerPick = useCallback(() => {
    if (triggerPickedByte === null) return;
    const bl = baselineRef.current;
    const mins = triggerMinsRef.current;
    const maxs = triggerMaxsRef.current;
    const bytes = latestBytes;
    const i = triggerPickedByte;
    const c: StickCandidate = {
      idx: i,
      range: mins.length > i ? maxs[i] - mins[i] : 0,
      min: mins.length > i ? mins[i] : 0,
      max: maxs.length > i ? maxs[i] : 255,
      center: bl.length > i ? bl[i] : (bytes.length > i ? bytes[i] : 0),
    };
    setTriggerPickMode(false);
    setTriggerPickedByte(null);
    finalizeTriggerRef.current(c);
  }, [triggerPickedByte, latestBytes]);

  const handleCancelTriggerPick = useCallback(() => {
    setTriggerPickMode(false);
    setTriggerPickedByte(null);
    setActiveTrigger(null);
    activeTriggerRef.current = null;
    addLog('Trigger pick mode cancelled.');
  }, [addLog]);

  // ── Start button detection (auto-advance walk) ──
  const handleStartButtons = useCallback(() => {
    const curItems = itemsRef.current;
    let firstIdx = -1;
    for (let i = 0; i < curItems.length; i++) {
      if (curItems[i].status !== 'captured' && curItems[i].status !== 'skipped' && !STICK_IDS.has(curItems[i].id) && !TRIGGER_IDS.has(curItems[i].id)) {
        firstIdx = i;
        break;
      }
    }
    if (firstIdx < 0) { addLog('All inputs already mapped!'); return; }
    setActiveIndex(firstIdx);
    setCaptureState('waiting-press');
    setAxisSubStep('pos');
    setAutoAdvanceWrapped(true);
    setInputPhaseActiveWrapped(true);
    setItems(prev => prev.map((it, i) => i === firstIdx ? { ...it, status: 'active' } : it));
    addLog('Auto-advance started — press each button when prompted.');
  }, [addLog]);

  // ── Clear a captured/skipped item ──
  const handleClearItem = useCallback((idx: number) => {
    const item = itemsRef.current[idx];
    if (!item) return;
    setItems(prev => prev.map((it, i) =>
      i === idx ? { ...it, status: 'pending', result: undefined, mapping: undefined, axisMapping: undefined } : it
    ));
    addLog(`Cleared: ${item.label}`);
    if (latestBytes.length > 0) updateByteStatuses(latestBytes.length);
  }, [addLog, latestBytes.length, updateByteStatuses]);

  // ── Manual byte assignment from grid ──
  const handleManualByteAssign = useCallback((byteIdx: number) => {
    const idx = activeIdxRef.current;
    const item = itemsRef.current[idx];
    if (!item || item.status === 'captured') return;
    if (item.kind !== 'button') {
      addLog(`Manual byte assign is for buttons only — ${item.label} is an axis.`);
      return;
    }
    const bl = baselineRef.current;
    const currentVal = latestBytes[byteIdx] ?? 0;
    const baseVal = bl[byteIdx] ?? 0;
    const delta = Math.abs(currentVal - baseVal);
    const xor = currentVal ^ baseVal;
    let mapping: HidButtonMapping;
    let result: string;
    if (delta >= ANALOG_THRESHOLD_DELTA && popcount(xor) > 3) {
      // Analog trigger: use threshold-based detection
      const threshold = baseVal + Math.floor(delta / 3);
      mapping = { byteIndex: byteIdx, bitMask: 0xFF, threshold, restValue: baseVal };
      result = `byte[${byteIdx}] analog (rest=${baseVal}, threshold=${threshold}) (manual)`;
    } else {
      // Digital: use bitmask
      const bitMask = xor !== 0 ? xor : 0xFF;
      mapping = { byteIndex: byteIdx, bitMask };
      result = `byte[${byteIdx}] & 0x${hex(bitMask)} (manual)`;
    }
    addLog(`✓ ${item.label}: ${result}`);
    setItems(prev => prev.map((it, i) =>
      i === idx ? { ...it, status: 'captured', result, mapping } : it
    ));
    if (latestBytes.length > 0) updateByteStatuses(latestBytes.length);
  }, [addLog, latestBytes, updateByteStatuses]);

  // ── Navigation ──
  const handleSkip = useCallback(() => {
    setItems(prev => prev.map((it, i) =>
      i === activeIdxRef.current ? { ...it, status: 'skipped', result: 'skipped' } : it
    ));
    setAxisSubStep('pos');
    doAdvance();
  }, [doAdvance]);

  const handleGoBack = useCallback(() => {
    if (activeIdxRef.current <= 0) return;
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    let prevIdx = activeIdxRef.current - 1;
    while (prevIdx >= 0 && (STICK_IDS.has(itemsRef.current[prevIdx]?.id) || TRIGGER_IDS.has(itemsRef.current[prevIdx]?.id))) prevIdx--;
    if (prevIdx < 0) return;
    setItems(prev => prev.map((it, i) => {
      if (i === activeIdxRef.current && it.status !== 'captured') return { ...it, status: 'pending' };
      if (i === prevIdx) return { ...it, status: 'active', result: undefined, mapping: undefined, axisMapping: undefined };
      return it;
    }));
    setActiveIndex(prevIdx);
    setCaptureState('waiting-press');
    setAxisSubStep('pos');
    releaseCountRef.current = 0;
    confirmCountRef.current = 0;
    detectedBtnRef.current = null;
    addLog(`← Back to: ${itemsRef.current[prevIdx]?.label}`);
  }, [addLog]);

  const handleClickItem = useCallback((idx: number) => {
    const item = itemsRef.current[idx];
    if (!item || STICK_IDS.has(item.id) || TRIGGER_IDS.has(item.id)) return;
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    // Deselect current active item (unless it's captured)
    setItems(prev => prev.map((it, i) => {
      if (i === activeIdxRef.current && it.status === 'active') return { ...it, status: 'pending' };
      if (i === idx && it.status !== 'captured') return { ...it, status: 'active' };
      return it;
    }));
    setActiveIndex(idx);
    setCaptureState('waiting-press');
    setAxisSubStep('pos');
    releaseCountRef.current = 0;
    confirmCountRef.current = 0;
    detectedBtnRef.current = null;
    // Ensure detection is listening
    if (!inputPhaseActiveRef.current) {
      setAutoAdvanceWrapped(false);
      setInputPhaseActiveWrapped(true);
    }
    addLog(`→ ${item.label}`);
  }, [addLog]);

  // ── Build JSON ──
  const buildCalibrationMap = useCallback((): HidControllerMap => {
    const buttons: Record<string, HidButtonMapping> = {};
    const axes: Record<string, HidAxisMapping> = {};
    for (const item of itemsRef.current) {
      if (item.kind === 'button' && item.mapping) buttons[item.id] = item.mapping;
      if (item.kind === 'axis' && item.axisMapping) axes[item.id] = item.axisMapping;
    }
    return {
      name: profile?.name ?? 'Unknown', profileId: profile?.id ?? 'generic',
      vendorId: deviceInfoRef.current.vendorId, productId: deviceInfoRef.current.productId,
      reportId: deviceInfoRef.current.reportId, reportLength: deviceInfoRef.current.reportLength,
      buttons, axes,
      excludedBytes: [...excludedRef.current].sort((a, b) => a - b),
      ...(Object.keys(idleResults).length > 0 && { idleData: idleResults }),
      createdAt: Date.now(),
    };
  }, [profile, idleResults]);

  const handleCopyJson = useCallback(() => {
    const json = JSON.stringify(buildCalibrationMap(), null, 2);
    navigator.clipboard.writeText(json);
    addLog('Copied calibration JSON to clipboard.');
  }, [buildCalibrationMap, addLog]);

  const handleFinish = useCallback(() => {
    onComplete(buildCalibrationMap());
  }, [buildCalibrationMap, onComplete]);

  // ── Instruction ──
  const getInstruction = (): string => {
    if (!inputPhaseActive) return '';
    const item = items[activeIndex];
    if (!item) return '';
    if (item.status === 'captured') return `"${item.label}" captured — click another button or click a byte to reassign.`;
    if (captureState === 'confirming-press') return `Detecting "${item.label}"...`;
    if (captureState === 'waiting-release') return `Got it! Release "${item.label}"...`;
    if (item.kind === 'button') return `Press "${item.label}" on controller, or click a byte in the grid to assign manually.`;
    const info = AXIS_LABELS[item.id];
    if (axisSubStep === 'pos') return info?.pos ?? 'Push axis to positive extreme';
    return info?.neg ?? 'Push axis to negative extreme';
  };

  // ── Byte color ──
  const getByteColor = (idx: number): { bg: string; border: string; text: string } => {
    if (gyroState === 'recording' && gyroChangedBytes.has(idx)) {
      return { bg: '#3b1a1a', border: '#f87171', text: '#f87171' };
    }
    const status = byteStatuses[idx] ?? 'unknown';
    switch (status) {
      case 'gyro': return { bg: '#1e1e2e', border: '#555', text: '#666' };
      case 'stick': return { bg: '#0f2a3d', border: '#38bdf8', text: '#38bdf8' };
      case 'trigger': return { bg: '#2d150f', border: '#fb923c', text: '#fb923c' };
      case 'button': return { bg: '#0f2e1a', border: '#4ade80', text: '#4ade80' };
      default: return { bg: '#1e1e2e', border: '#4a5568', text: '#c9d1d9' };
    }
  };

  const handleByteClick = useCallback((idx: number) => {
    // Route to stick picking if in pick mode
    if (stickPickMode) {
      handleStickBytePicked(idx);
      return;
    }
    // Route to trigger picking if in pick mode
    if (triggerPickMode) {
      handleTriggerBytePicked(idx);
      return;
    }
    // Route to manual button assignment if a button item is active
    const activeItem = itemsRef.current[activeIdxRef.current];
    if (activeItem && activeItem.status === 'active' && inputPhaseActiveRef.current) {
      handleManualByteAssign(idx);
      return;
    }
    const excl = new Set(excludedRef.current);
    if (excl.has(idx)) {
      excl.delete(idx);
      addLog(`byte[${idx}] manually included`);
    } else {
      excl.add(idx);
      addLog(`byte[${idx}] manually excluded`);
    }
    excludedRef.current = excl;
    setGyroExcluded(new Set(excl));
    if (latestBytes.length > 0) updateByteStatuses(latestBytes.length);
  }, [addLog, latestBytes.length, updateByteStatuses, stickPickMode, handleStickBytePicked, triggerPickMode, handleTriggerBytePicked, handleManualByteAssign]);

  const capturedCount = items.filter(it => it.status === 'captured' || it.status === 'skipped').length;
  const buttonItems = items.filter(it => !STICK_IDS.has(it.id) && !TRIGGER_IDS.has(it.id));
  const buttonCapturedCount = buttonItems.filter(it => it.status === 'captured' || it.status === 'skipped').length;

  // ═══════════════════════════════════════════════════════════════════════════
  // Render: profile selection
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'select-profile') {
    return (
      <div className="hid-cal">
        <div className="hid-cal__header">
          <h3 className="hid-cal__title">HID Calibration — Select Controller</h3>
          <button onClick={onCancel} className="input-cal__btn input-cal__btn--danger">Cancel</button>
        </div>
        <p className="hid-cal__desc">
          Identify your controller from the SDL database (893+ controllers).
          The calibration profile is auto-detected from VID:PID.
          {selectedSdlVidPid && !hasGyro && ' Gyro step will be skipped (no gyro detected).'}
          {selectedSdlVidPid && hasGyro && ' 🔄 Gyro detected — gyro profiling will be available.'}
        </p>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>
            Controller (SDL Database)
          </label>
          <Select
            value={selectedSdlVidPid}
            onChange={handleSdlSelect}
            options={sdlOptions}
            placeholder="Search controllers..."
            searchable
          />
        </div>

        {selectedProfileId && (
          <p style={{ fontSize: 12, color: '#6ee7b7', margin: '0 0 12px' }}>
            ✓ Profile auto-detected: <strong>{DEVICE_PROFILES.find(p => p.id === selectedProfileId)?.name ?? selectedProfileId}</strong>
          </p>
        )}
        {!selectedProfileId && selectedSdlVidPid && (
          <p style={{ fontSize: 12, color: '#fbbf24', margin: '0 0 12px' }}>
            ⚠ No built-in profile for this device — calibration will use a generic layout.
          </p>
        )}

        <button onClick={handleProfileConfirm} disabled={!selectedProfileId}
          className="input-cal__btn input-cal__btn--primary">
          Start Calibration
        </button>
        {renderLog()}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Render: live calibration view
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="hid-cal">
      {/* Header */}
      <div className="hid-cal__header">
        <h3 className="hid-cal__title">HID Calibration — {profile?.name ?? 'Controller'}</h3>
        <div className="hid-cal__header-actions">
          <button onClick={handleCopyJson} className="input-cal__btn" title="Copy partial or complete calibration JSON">
            Copy JSON
          </button>
          <button onClick={handleFinish} className="input-cal__btn input-cal__btn--primary" disabled={capturedCount === 0}>
            Finish
          </button>
          <button onClick={onCancel} className="input-cal__btn input-cal__btn--danger">Cancel</button>
        </div>
      </div>

      {/* ── Prereqs: Gyro + Idle side by side ── */}
      <div className="hid-cal__prereqs">
        {hasGyro && (
        <div className={`hid-cal__prereq-card${gyroState === 'done' ? ' hid-cal__prereq-card--done' : ''}`}>
          <div className="hid-cal__prereq-title">
            <span>{gyroState === 'done' ? '✓' : '1.'} Gyro Profiling</span>
            {gyroState === 'done' && <span className="hid-cal__prereq-badge">{gyroExcluded.size} excluded</span>}
          </div>
          <p className="hid-cal__desc">
            {gyroState === 'idle' && 'Pick up controller. Start recording, then tilt/rotate/shake.'}
            {gyroState === 'recording' && 'Recording... move the controller freely. Stop when done.'}
            {gyroState === 'done' && 'Gyro bytes identified and excluded.'}
          </p>
          <div className="hid-cal__prereq-actions">
            {gyroState === 'idle' && (
              <>
                <button onClick={handleGyroStart} className="input-cal__btn input-cal__btn--primary"
                  disabled={latestBytes.length === 0}>Start Recording</button>
                <button onClick={() => { setGyroState('done'); addLog('Gyro profiling skipped.'); }}
                  className="input-cal__btn">Skip</button>
              </>
            )}
            {gyroState === 'recording' && (
              <button onClick={handleGyroStop} className="input-cal__btn input-cal__btn--danger">Stop Recording</button>
            )}
            {gyroState === 'done' && (
              <button onClick={handleGyroRedo} className="input-cal__btn">Redo</button>
            )}
          </div>
        </div>
        )}

        <div className={`hid-cal__prereq-card${idleState === 'done' ? ' hid-cal__prereq-card--done' : ''}`}>
          <div className="hid-cal__prereq-title">
            <span>{idleState === 'done' ? '✓' : '2.'} Idle Baseline</span>
          </div>
          <p className="hid-cal__desc">
            {idleState === 'idle' && 'Set controller down, don\'t touch it, then capture.'}
            {idleState === 'done' && 'Baseline captured.'}
          </p>
          <div className="hid-cal__prereq-actions">
            {idleState === 'idle' && (
              <button onClick={handleIdleCapture} className="input-cal__btn input-cal__btn--primary"
                disabled={latestBytes.length === 0}>Capture Idle</button>
            )}
            {idleState === 'done' && (
              <button onClick={handleIdleRedo} className="input-cal__btn">Redo</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Step 3: Sticks — two independent cards ── */}
      {prereqsDone && (
        <div className="hid-cal__prereqs">
          {(['left', 'right'] as const).map(side => {
            const label = side === 'left' ? 'LEFT' : 'RIGHT';
            const xId = side === 'left' ? 'leftX' : 'rightX';
            const yId = side === 'left' ? 'leftY' : 'rightY';
            const xItem = items.find(it => it.id === xId);
            const yItem = items.find(it => it.id === yId);
            const isDone = (xItem?.status === 'captured' || xItem?.status === 'skipped')
              && (yItem?.status === 'captured' || yItem?.status === 'skipped');
            const isActive = activeStick === side;
            const isPicking = isActive && stickPickMode;
            const isRecording = isActive && stickBusy && !stickPickMode;
            const otherBusy = activeStick !== null && activeStick !== side;

            return (
              <div key={side} className={`hid-cal__prereq-card${isDone ? ' hid-cal__prereq-card--done' : ''}`}>
                <div className="hid-cal__prereq-title">
                  <span>{isDone ? '✓' : '3.'} {label} Stick</span>
                  {isDone && <span className="hid-cal__prereq-badge">
                    {xItem?.result ? xItem.result.split(' ')[0] : ''} {yItem?.result ? yItem.result.split(' ')[0] : ''}
                  </span>}
                </div>

                {isPicking && (
                  <p className="hid-cal__desc">
                    Click 1-2 byte boxes below, then Confirm. [{stickPickedBytes.join(', ')}]
                  </p>
                )}
                {isRecording && stickLiveInfo && (
                  <div className="hid-cal__stick-info">{stickLiveInfo}</div>
                )}
                {isRecording && !stickLiveInfo && (
                  <p className="hid-cal__desc">Rotate slowly in a full circle...</p>
                )}
                {!isActive && isDone && (
                  <p className="hid-cal__desc" style={{ fontSize: 10 }}>
                    X: {xItem?.result ?? '—'}<br/>Y: {yItem?.result ?? '—'}
                  </p>
                )}

                <div className="hid-cal__prereq-actions">
                  {isPicking ? (
                    <>
                      <button onClick={handleConfirmPick} disabled={stickPickedBytes.length === 0}
                        className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>
                        Confirm ({stickPickedBytes.length})
                      </button>
                      <button onClick={handleCancelPick} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>
                        Cancel
                      </button>
                    </>
                  ) : isRecording ? (
                    <button onClick={handleStopCircle} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>
                      Stop
                    </button>
                  ) : isDone ? (
                    <>
                      <button onClick={() => handleStickRedo(side)} disabled={otherBusy} className="input-cal__btn" style={{ fontSize: 11 }}>
                        Redo
                      </button>
                      <button
                        disabled={idleRecording !== null}
                        className={`input-cal__btn${idleResults[`${label} Stick`] ? ' input-cal__btn--done' : ''}`}
                        style={{ fontSize: 11 }}
                        onClick={() => {
                          const byteIndices: number[] = [];
                          if (xItem?.axisMapping) byteIndices.push(xItem.axisMapping.byteIndex);
                          if (yItem?.axisMapping) byteIndices.push(yItem.axisMapping.byteIndex);
                          if (byteIndices.length > 0) handleIdleRecord(`${label} Stick`, byteIndices);
                        }}
                      >
                        {idleRecording === `${label} Stick` ? 'Recording...' : idleResults[`${label} Stick`] ? '✓ Idle' : 'Idle'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleStartCircle(side)} disabled={otherBusy}
                        className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>Start</button>
                      <button onClick={() => handleStickPickMode(side)} disabled={otherBusy}
                        className="input-cal__btn" style={{ fontSize: 11 }}>Pick</button>
                      <button onClick={() => handleSkipStick(side)} disabled={otherBusy}
                        className="input-cal__btn" style={{ fontSize: 11 }}>Skip</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Step 3b: Triggers — independent cards ── */}
      {prereqsDone && items.some(it => TRIGGER_IDS.has(it.id)) && (
        <div className="hid-cal__prereqs">
          {(['left', 'right'] as const).map(side => {
            const axisId = side === 'left' ? 'leftTrigger' : 'rightTrigger';
            const item = items.find(it => it.id === axisId);
            if (!item) return null;
            const label = item.label;
            const isDone = item.status === 'captured' || item.status === 'skipped';
            const isActive = activeTrigger === side;
            const isPicking = isActive && triggerPickMode;
            const isRecording = isActive && triggerBusy && !triggerPickMode;
            const otherBusy = activeTrigger !== null && activeTrigger !== side;

            return (
              <div key={side} className={`hid-cal__prereq-card${isDone ? ' hid-cal__prereq-card--done' : ''}`}>
                <div className="hid-cal__prereq-title">
                  <span>{isDone ? '✓' : '⊳'} {label}</span>
                  {isDone && item.result && <span className="hid-cal__prereq-badge">
                    {item.result.split(' ')[0]}
                  </span>}
                </div>

                {isPicking && (
                  <p className="hid-cal__desc">
                    Click 1 byte box below, then Confirm. [{triggerPickedByte ?? '—'}]
                  </p>
                )}
                {isRecording && triggerLiveInfo && (
                  <div className="hid-cal__stick-info">{triggerLiveInfo}</div>
                )}
                {isRecording && !triggerLiveInfo && (
                  <p className="hid-cal__desc">Press the trigger fully and release...</p>
                )}
                {!isActive && isDone && (
                  <p className="hid-cal__desc" style={{ fontSize: 10 }}>
                    {item.result ?? '—'}
                  </p>
                )}

                <div className="hid-cal__prereq-actions">
                  {isPicking ? (
                    <>
                      <button onClick={handleConfirmTriggerPick} disabled={triggerPickedByte === null}
                        className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>
                        Confirm
                      </button>
                      <button onClick={handleCancelTriggerPick} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>
                        Cancel
                      </button>
                    </>
                  ) : isRecording ? (
                    <button onClick={handleStopTrigger} className="input-cal__btn input-cal__btn--danger" style={{ fontSize: 11 }}>
                      Stop
                    </button>
                  ) : isDone ? (
                    <>
                      <button onClick={() => handleTriggerRedo(side)} disabled={otherBusy} className="input-cal__btn" style={{ fontSize: 11 }}>
                        Redo
                      </button>
                      <button
                        disabled={idleRecording !== null}
                        className={`input-cal__btn${idleResults[label] ? ' input-cal__btn--done' : ''}`}
                        style={{ fontSize: 11 }}
                        onClick={() => {
                          const byteIndices: number[] = [];
                          if (item?.axisMapping) byteIndices.push(item.axisMapping.byteIndex);
                          if (byteIndices.length > 0) handleIdleRecord(label, byteIndices);
                        }}
                      >
                        {idleRecording === label ? 'Recording...' : idleResults[label] ? '✓ Idle' : 'Idle'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleStartTrigger(side)} disabled={otherBusy}
                        className="input-cal__btn input-cal__btn--primary" style={{ fontSize: 11 }}>Start</button>
                      <button onClick={() => handleTriggerPickMode(side)} disabled={otherBusy}
                        className="input-cal__btn" style={{ fontSize: 11 }}>Pick</button>
                      <button onClick={() => handleSkipTrigger(side)} disabled={otherBusy}
                        className="input-cal__btn" style={{ fontSize: 11 }}>Skip</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Step 4: Buttons — always visible after prereqs ── */}
      {prereqsDone && (
        <div className="hid-cal__step">
          <div className="hid-cal__step-title">
            4. Button & Axis Mapping — {buttonCapturedCount}/{buttonItems.length}
          </div>

          {inputPhaseActive && (
            <div className="hid-cal__instruction">
              {getInstruction()}
              {items[activeIndex]?.kind === 'axis' && captureState === 'waiting-press' && (
                <span className="hid-cal__axis-sub">
                  [{axisSubStep === 'pos' ? '1/2 positive' : '2/2 negative'}]
                </span>
              )}
            </div>
          )}

          <div className="hid-cal__input-grid">
            {items.map((item, i) => {
              const isStick = STICK_IDS.has(item.id);
              const isTrigger = TRIGGER_IDS.has(item.id);
              if (isStick || isTrigger) return null;
              const isActive = i === activeIndex && inputPhaseActive;
              const icon = item.status === 'captured' ? '✓' : item.status === 'skipped' ? '⊘' : item.status === 'active' ? '►' : '·';
              const canClick = prereqsDone;
              const canClear = item.status === 'captured' || item.status === 'skipped';
              return (
                <div key={item.id}
                  className={`hid-cal__input-item hid-cal__input-item--${item.status}${isActive ? ' hid-cal__input-item--focus' : ''}`}
                  style={{ cursor: canClick ? 'pointer' : 'default' }}>
                  <span className="hid-cal__input-icon" onClick={() => canClick && handleClickItem(i)}>{icon}</span>
                  <span className="hid-cal__input-name" onClick={() => canClick && handleClickItem(i)}>{item.label}{item.kind === 'axis' ? ' 🕹️' : ''}</span>
                  {item.result && <span className="hid-cal__input-result">{item.result}</span>}
                  {canClear && (
                    <button className="hid-cal__input-clear" title={`Clear ${item.label}`}
                      onClick={(e) => { e.stopPropagation(); handleClearItem(i); }}>×</button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hid-cal__prereq-actions">
            {!inputPhaseActive ? (
              <button onClick={handleStartButtons} className="input-cal__btn input-cal__btn--primary">
                Auto-Advance All
              </button>
            ) : autoAdvance ? (
              <>
                <button onClick={handleGoBack} disabled={activeIndex <= 0} className="input-cal__btn">← Back</button>
                <button onClick={handleSkip} className="input-cal__btn">Skip</button>
                <button onClick={() => { setAutoAdvanceWrapped(false); }} className="input-cal__btn">
                  Stop Auto
                </button>
                <button onClick={() => setInputPhaseActiveWrapped(false)} className="input-cal__btn">Pause</button>
              </>
            ) : (
              <>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>
                  Click a button above to detect, or click a byte in the grid to assign manually.
                </span>
                <button onClick={() => setInputPhaseActiveWrapped(false)} className="input-cal__btn">Deselect</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Live Byte Grid ── */}
      <div className="hid-cal__step">
        <div className="hid-cal__step-title">Live Bytes — Report 0x{lastReportIdRef.current.toString(16)}</div>
        <div className="hid-cal__byte-grid">
          {Array.from(latestBytes).map((b, i) => {
            const colors = getByteColor(i);
            const isChanged = baselineRef.current.length > i && baselineRef.current[i] !== b && !excludedRef.current.has(i);
            const isPicked = (stickPickMode && stickPickedBytes.includes(i)) || (triggerPickMode && triggerPickedByte === i);
            const pickHighlight = (stickPickMode || triggerPickMode) && !isPicked;
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
                : (inputPhaseActive && itemsRef.current[activeIdxRef.current]?.status === 'active'
                  ? `byte[${i}] = 0x${hex(b)} (${b}) — click to assign to "${itemsRef.current[activeIdxRef.current]?.label}"`
                  : `byte[${i}] = 0x${hex(b)} (${b}) — ${byteStatuses[i] ?? 'unknown'}\nClick to toggle exclusion`)}
                onClick={() => handleByteClick(i)}>
                <span className="hid-cal__byte-idx">{i}</span>
                <span className="hid-cal__byte-val">{hex(b)}</span>
              </div>
            );
          })}
        </div>
        {latestBytes.length === 0 && (
          <div className="hid-cal__desc">Waiting for HID reports...</div>
        )}
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

      {/* ── Log ── */}
      <div className="hid-cal__step">
        <div className="hid-cal__step-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          Log
          <button className="input-cal__btn" style={{ fontSize: 10, padding: '2px 8px' }}
            onClick={() => navigator.clipboard.writeText(log.join('\n'))}>Copy</button>
        </div>
        {renderLog()}
      </div>
    </div>
  );

  function renderLog() {
    return (
      <div ref={logRef} className="input-cal__log" style={{ maxHeight: 150 }}>
        {log.length === 0 && <div className="input-cal__log-entry">Waiting...</div>}
        {log.map((entry, i) => (
          <div key={i} className="input-cal__log-entry" style={{ whiteSpace: 'pre-wrap' }}>{entry}</div>
        ))}
      </div>
    );
  }
}
