/* @layer renderer-components @kind hook */
/**
 * Orchestration for the rebuilt positional-capture step: the same one-by-one
 * interaction ButtonMapping already renders for byte-capture (prompt, wait,
 * record, advance, skip, go back), driven here from joystick-level samples
 * instead of raw-byte diffs. Builds its ask list from the connected device's
 * own resolved controls (see build-positional-targets.ts); trimTargetsToDevice
 * is a safety net against the first live sample, since the resolved list
 * should already match exactly what the device reports.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { controllerInputStore } from '@app/lib/input/controller-input-store';
import type { ControllerJoystickSample } from '@shared/ipc';
import type { ResolvedDevice } from '@shared/input/family';
import type { InputItem } from '../../hid-calibration/hid-calibration.type';
import { buildPositionalTargets } from './build-positional-targets';
import {
  buildRecord, describeRecord, detectFiredIndex, growAxisRanges, instructionFor,
  isAtRest, startAxisRanges, trimTargetsToDevice, widestAxis,
} from './positional-detect';
import type { AxisRanges } from './positional-detect';
import type { PositionalCaptureRecord, PositionalTarget } from './positional-capture.type';

interface UsePositionalOneByOneProps {
  deviceKey: string | null;
  active: boolean;
  resolvedDevice: ResolvedDevice | null;
}

const toItem = (target: PositionalTarget): InputItem =>
  ({ kind: target.kind, id: target.id, label: target.label, category: target.category, status: 'pending' });

const usePositionalOneByOne = (props: UsePositionalOneByOneProps) => {
  const { deviceKey, active, resolvedDevice } = props;

  const [items, setItems] = useState<InputItem[]>([]);
  const [records, setRecords] = useState<PositionalCaptureRecord[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [inputPhaseActive, setInputPhaseActive] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);

  const targetsRef = useRef<PositionalTarget[]>([]);
  const trimmedRef = useRef(false);
  const activeIndexRef = useRef(-1);
  const inputPhaseActiveRef = useRef(false);
  const autoAdvanceRef = useRef(false);
  const baselineRef = useRef<ControllerJoystickSample | null>(null);
  const latestSampleRef = useRef<ControllerJoystickSample | null>(null);
  const rangesRef = useRef<AxisRanges>([]);
  const awaitingRestRef = useRef(false);

  const setInputPhaseActiveWrapped = useCallback((v: boolean) => { inputPhaseActiveRef.current = v; setInputPhaseActive(v); }, []);
  const setAutoAdvanceWrapped = useCallback((v: boolean) => { autoAdvanceRef.current = v; setAutoAdvance(v); }, []);

  // Builds the ask list once per device, stable while this step stays active.
  useEffect(() => {
    if (!active) return;
    const targets = buildPositionalTargets(resolvedDevice);
    targetsRef.current = targets;
    trimmedRef.current = false;
    setItems(targets.map(toItem));
    setRecords([]);
    activeIndexRef.current = -1; setActiveIndex(-1);
    setInputPhaseActiveWrapped(false);
  }, [active, resolvedDevice, setInputPhaseActiveWrapped]);

  const activateIndex = useCallback((idx: number) => {
    activeIndexRef.current = idx; setActiveIndex(idx);
    baselineRef.current = latestSampleRef.current;
    rangesRef.current = latestSampleRef.current ? startAxisRanges(latestSampleRef.current) : [];
    // The controller is usually still moving from the previous answer. Nothing
    // is accepted until it has come back to rest, which is what keeps one stick
    // sweep from answering every remaining item in a single frame.
    awaitingRestRef.current = true;
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, status: 'active' } : it)));
  }, []);

  const advance = useCallback(() => {
    const next = activeIndexRef.current + 1;
    if (next >= targetsRef.current.length) { setInputPhaseActiveWrapped(false); return; }
    activateIndex(next);
  }, [activateIndex, setInputPhaseActiveWrapped]);

  const answerActive = useCallback((status: PositionalCaptureRecord['status'], firedIndex: number | null) => {
    const idx = activeIndexRef.current;
    const target = targetsRef.current[idx];
    if (!target) return;
    const record = buildRecord(target, status, firedIndex);
    setRecords((prev) => { const next = [...prev]; next[idx] = record; return next; });
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, status, result: describeRecord(record) } : it)));
    if (autoAdvanceRef.current) advance();
  }, [advance]);

  // Reads the same decoded gamepad layer the calibration screen uses, so a
  // recorded position means what its name says. The joystick layer underneath
  // numbers its buttons and axes differently, and naming those numbers with
  // positional names produced records that disagreed with the rest of the app.
  useEffect(() => {
    if (!active || !deviceKey) return;
    const unsub = controllerInputStore.onInput((state) => {
      if (state.deviceKey !== deviceKey) return;
      const sample: ControllerJoystickSample = { id: 0, buttons: state.buttons, axes: state.axes, hats: [] };
      latestSampleRef.current = sample;
      if (!trimmedRef.current) { trimmedRef.current = true; targetsRef.current = trimTargetsToDevice(targetsRef.current, sample); setItems(targetsRef.current.map(toItem)); }
      if (!inputPhaseActiveRef.current) return;
      const target = targetsRef.current[activeIndexRef.current];
      const baseline = baselineRef.current;
      if (!target || !baseline) return;

      // Hold everything until the pad settles after the previous answer, then
      // re-baseline from that resting position so this item measures only what
      // the user does next.
      if (awaitingRestRef.current) {
        if (!isAtRest(baseline, sample)) return;
        awaitingRestRef.current = false;
        baselineRef.current = sample;
        rangesRef.current = startAxisRanges(sample);
        return;
      }

      if (target.kind === 'button') {
        const firedIndex = detectFiredIndex(target, baseline, sample);
        if (firedIndex !== null) answerActive('captured', firedIndex);
        return;
      }

      // An axis is identified by how far it travels, not by the first frame it
      // moves. The answer lands once the control returns to rest, so the whole
      // motion is measured before advancing.
      rangesRef.current = growAxisRanges(rangesRef.current, sample);
      const candidate = widestAxis(rangesRef.current);
      if (candidate !== null && isAtRest(baseline, sample)) answerActive('captured', candidate);
    });
    return unsub;
  }, [active, deviceKey, answerActive]);

  const onStartButtons = useCallback(() => {
    setAutoAdvanceWrapped(true); setInputPhaseActiveWrapped(true);
    activateIndex(0);
  }, [activateIndex, setAutoAdvanceWrapped, setInputPhaseActiveWrapped]);

  const onSkip = useCallback(() => answerActive('skipped', null), [answerActive]);

  const onGoBack = useCallback(() => {
    const idx = activeIndexRef.current;
    if (idx <= 0) return;
    const prevIdx = idx - 1;
    setItems((prev) => prev.map((it, i) => {
      if (i === idx && it.status === 'active') return { ...it, status: 'pending' };
      if (i === prevIdx) return { ...it, status: 'active', result: undefined };
      return it;
    }));
    setRecords((prev) => { const next = [...prev]; delete next[prevIdx]; return next; });
    activeIndexRef.current = prevIdx; setActiveIndex(prevIdx);
    baselineRef.current = latestSampleRef.current;
  }, []);

  const onClickItem = useCallback((idx: number) => {
    setAutoAdvanceWrapped(true); setInputPhaseActiveWrapped(true);
    activateIndex(idx);
  }, [activateIndex, setAutoAdvanceWrapped, setInputPhaseActiveWrapped]);

  const onClearItem = useCallback((idx: number) => {
    setRecords((prev) => { const next = [...prev]; delete next[idx]; return next; });
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, status: 'pending', result: undefined } : it)));
  }, []);

  const capturedCount = items.filter((it) => it.status === 'captured' || it.status === 'skipped').length;
  const activeTarget = targetsRef.current[activeIndex];
  const instruction = inputPhaseActive && activeTarget ? instructionFor(activeTarget) : '';

  return {
    items, records, activeIndex, inputPhaseActive, autoAdvance, capturedCount, instruction,
    onStartButtons, onSkip, onGoBack, onClickItem, onClearItem,
    setAutoAdvanceWrapped, setInputPhaseActiveWrapped,
  };
};

export { usePositionalOneByOne };
