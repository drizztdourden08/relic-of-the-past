/* @layer renderer-components @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useCallback } from 'react';
import type { HidControllerMap } from '../hid-calibration.type';
import type { ActionDeps } from './action-deps.type';
import { guessConnectionHint } from '../connection-hint';
import { collectItemMappings } from './collect-item-mappings';
import { sdlEntryFields } from './sdl-entry-fields';

const useCalibrationExport = (d: ActionDeps) => {
  const buildCalibrationMap = useCallback((): HidControllerMap => {
    const { buttons, axes } = collectItemMappings(d.itemsRef.current);
    const raw = d.rawInfoRef.current;
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
      ...sdlEntryFields(d.capturedEntry),
      sdlVersion: d.sdlVersion,
    };
  }, [d.profile, d.idleResults, d.rawInfoRef, d.platform, d.appVersion, d.capturedEntry, d.sdlVersion]);

  const handleCopyJson = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildCalibrationMap(), null, 2));
      d.addLog('OK Copied calibration JSON to clipboard.');
      return true;
    } catch (err) {
      d.addLog(`Warning: Failed to copy JSON: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [buildCalibrationMap, d.addLog]);

  const handleFinish = useCallback(() => { d.onComplete(buildCalibrationMap()); }, [buildCalibrationMap, d.onComplete]);

  const handleSaveDebugFile = useCallback(async (): Promise<boolean> => {
    const map = buildCalibrationMap();
    try {
      const filePath = await requireHostApi().writeHidDebugFile(map.name || map.profileId, map);
      d.addLog(`OK Saved calibration to ${filePath}`);
      return true;
    } catch (err) {
      d.addLog(`Warning: Failed to save debug file: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }, [buildCalibrationMap, d.addLog]);

  return { buildCalibrationMap, handleCopyJson, handleFinish, handleSaveDebugFile };
};

export { useCalibrationExport };
