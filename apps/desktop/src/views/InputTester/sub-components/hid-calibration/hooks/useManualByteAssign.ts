/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { ActionDeps } from './action-deps.type';
import { buildManualMapping } from './build-manual-mapping';

const useManualByteAssign = (d: ActionDeps) => {
  const handleManualByteAssign = useCallback((byteIdx: number) => {
    const idx = d.activeIdxRef.current; const item = d.itemsRef.current[idx];
    if (!item || item.status === 'captured') return;
    if (item.kind !== 'button') { d.addLog(`Manual byte assign is for buttons only, and ${item.label} is an axis.`); return; }
    const currentVal = d.latestBytes[byteIdx] ?? 0; const baseVal = d.baselineRef.current[byteIdx] ?? 0;
    const { mapping, result } = buildManualMapping(byteIdx, currentVal, baseVal);
    d.addLog(`OK ${item.label}: ${result}`);
    d.setItems(prev => prev.map((it, i) => i === idx ? { ...it, status: 'captured', result, mapping } : it));
    if (d.latestBytes.length > 0) d.updateByteStatuses(d.latestBytes.length);
  }, [d.addLog, d.latestBytes, d.updateByteStatuses]);

  return { handleManualByteAssign };
};

export { useManualByteAssign };
