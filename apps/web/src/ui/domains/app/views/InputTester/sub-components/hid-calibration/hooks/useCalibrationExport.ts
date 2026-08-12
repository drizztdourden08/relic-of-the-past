/* @layer renderer-components @kind hook */
/**
 * Export actions for a finished calibration: assembling the HidControllerMap,
 * copying it to the clipboard, saving it to the debug folder, and handing it
 * to onComplete. Split out of useCalibrationActions.ts for file-size compliance.
 */
import { useCallback } from 'react';
import type { HidAxisMapping, HidButtonMapping, HidControllerMap } from '../hid-calibration.type';
import type { ActionDeps } from './action-deps';
import { guessConnectionHint } from '../connection-hint';

const useCalibrationExport = (d: ActionDeps) => {
  const buildCalibrationMap = useCallback((): HidControllerMap => {
    const buttons: Record<string, HidButtonMapping> = {}; const axes: Record<string, HidAxisMapping> = {};
    // An axis item can hold either shape. A trigger that turned out to be a
    // switch carries a bit mapping, not a range, and matching only on kind
    // dropped both of them from the report while the UI showed them captured.
    for (const item of d.itemsRef.current) {
      if (item.axisMapping) axes[item.id] = item.axisMapping;
      else if (item.mapping) buttons[item.id] = item.mapping;
    }
    const raw = d.rawInfoRef.current;
    const entry = d.capturedEntry;
    return {
      name: d.profile?.name ?? 'Unknown', profileId: d.profile?.id ?? 'generic',
      vendorId: d.deviceInfoRef.current.vendorId, productId: d.deviceInfoRef.current.productId,
      reportId: d.deviceInfoRef.current.reportId, reportLength: d.deviceInfoRef.current.reportLength,
      buttons, axes, excludedBytes: [...d.excludedRef.current].sort((a, b) => a - b),
      ...(Object.keys(d.idleResults).length > 0 && { idleData: d.idleResults }),
      createdAt: Date.now(),
      devicePath: raw.path, connectionHint: guessConnectionHint(raw.busType),
      rawManufacturer: raw.manufacturer, rawProduct: raw.product, serialNumber: raw.serialNumber,
      platform: d.platform, appVersion: d.appVersion,
      // Read from the same entry the layout came from, so the identity and
      // the capability view in a report always describe one observation.
      guid: entry?.guid ?? null,
      sdlMapping: entry?.mapping ?? null,
      sdlType: entry?.sdlType ?? null,
      sdlHasButton: entry?.hasButton ?? null,
      sdlHasAxis: entry?.hasAxis ?? null,
      sdlVersion: d.sdlVersion,
    };
  }, [d.profile, d.idleResults, d.rawInfoRef, d.platform, d.appVersion, d.capturedEntry, d.sdlVersion]);

  const handleCopyJson = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildCalibrationMap(), null, 2));
      d.addLog('✓ Copied calibration JSON to clipboard.');
      return true;
    } catch (err) {
      d.addLog(`⚠ Failed to copy JSON: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [buildCalibrationMap, d.addLog]);

  const handleFinish = useCallback(() => { d.onComplete(buildCalibrationMap()); }, [buildCalibrationMap, d.onComplete]);

  const handleSaveDebugFile = useCallback(async (): Promise<boolean> => {
    const map = buildCalibrationMap();
    try {
      const filePath = await window.api.writeHidDebugFile(map.name || map.profileId, map);
      d.addLog(`✓ Saved calibration to ${filePath}`);
      return true;
    } catch (err) {
      d.addLog(`⚠ Failed to save debug file: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [buildCalibrationMap, d.addLog]);

  return { buildCalibrationMap, handleCopyJson, handleFinish, handleSaveDebugFile };
};

export { useCalibrationExport };
