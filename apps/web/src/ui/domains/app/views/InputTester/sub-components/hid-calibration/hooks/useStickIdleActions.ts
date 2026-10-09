/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { StickSide } from '../hid-calibration.type';
import type { ActionDeps } from './action-deps.type';
import { createIdleSampler } from '../stick-center';
import type { IdleResult } from '../stick-center';
import { idleReadingRecord } from './idle-reading-record';

const useStickIdleActions = (d: ActionDeps) => {
  const handleStickIdle = useCallback((side: StickSide) => {
    const xId = side === 'left' ? 'leftX' : 'rightX';
    const yId = side === 'left' ? 'leftY' : 'rightY';
    const items = d.itemsRef.current;
    const x = items.find((it) => it.id === xId)?.axisMapping;
    const y = items.find((it) => it.id === yId)?.axisMapping;
    if (!x) { d.addLog('Map the stick first, then read its idle.'); return; }

    const asCandidate = (m: typeof x) => ({ idx: m.byteIndex, range: m.max - m.min, min: m.min, max: m.max, center: m.center });
    d.activeStickRef.current = side; d.setActiveStick(side); d.setStickBusy(true);
    d.stickIdleRef.current = createIdleSampler(asCandidate(x), y ? asCandidate(y) : null, Date.now());
    d.setStickLiveInfo('Reading idle...');
    d.addLog(`Reading ${side === 'left' ? 'LEFT' : 'RIGHT'} stick idle. Leave the stick alone.`);
  }, [d.addLog]);

  const applyIdle = useCallback((result: IdleResult) => {
    const side = d.activeStickRef.current ?? 'left';
    const label = side === 'left' ? 'LEFT' : 'RIGHT';
    const xId = side === 'left' ? 'leftX' : 'rightX';
    const yId = side === 'left' ? 'leftY' : 'rightY';
    const byIdx = new Map<string, typeof result.x>([[xId, result.x]]);
    if (result.y) byIdx.set(yId, result.y);

    d.setItems((prev) => prev.map((it) => {
      const measured = byIdx.get(it.id);
      if (!measured || !it.axisMapping) return it;
      const mapping = { ...it.axisMapping, center: measured.center, idle: measured.idle };
      return { ...it, axisMapping: mapping, result: `byte[${mapping.byteIndex}] ${mapping.min}..${mapping.center}..${mapping.max} (idle drift ${measured.idle.drift})` };
    }));

    d.recordIdleResult(`${label} Stick`, idleReadingRecord(`${label} Stick`, result));
    d.addLog(`✓ ${label} idle: centre ${result.x.center}${result.y ? `, ${result.y.center}` : ''} (drift ${result.x.idle.drift}${result.y ? `, ${result.y.idle.drift}` : ''})`);
    d.setStickBusy(false); d.setActiveStick(null); d.activeStickRef.current = null; d.setStickLiveInfo('');
    if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes.length, d.updateByteStatuses, d.recordIdleResult]);
  d.applyIdleRef.current = applyIdle;

  return { handleStickIdle };
};

export { useStickIdleActions };
