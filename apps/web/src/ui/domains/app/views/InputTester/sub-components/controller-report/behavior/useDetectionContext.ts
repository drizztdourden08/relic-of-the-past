/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { findPresetByVidPid } from '@shared/input';
import { DEVICE_DATABASE } from '@shared/input/data/devices';
import { webHidReader } from '@app/lib/input/hid-reader';

interface DetectionContext {
  detectedName: string;
  sdlMatch: string | null;
  inputApi: string;
  vendorId: string;
  productId: string;
  hidReport: string;
}

/** Snapshots what the app currently knows about a device — resolved preset,
 *  closest SDL entry, and recent raw HID traffic — for a "report as not working" bundle. */
const useDetectionContext = (deviceKey: string): DetectionContext => {
  return useMemo(() => {
    const [vendorId = '0000', productId = '0000'] = deviceKey.split(':');
    const preset = findPresetByVidPid(vendorId, productId);
    const sdlEntry = DEVICE_DATABASE.find((e) => e.vidPid === `${vendorId}:${productId}`);
    const detectedName = preset?.name ?? sdlEntry?.name ?? 'Unrecognized controller';
    const rawLog = webHidReader.getRawReportLog();

    const hidReport = [
      `deviceKey: ${deviceKey}`,
      `vendorId: ${vendorId}  productId: ${productId}`,
      `resolved preset: ${preset?.id ?? 'none (generic/unresolved)'}`,
      '',
      `Recent raw report log (last ${Math.min(rawLog.length, 20)} of ${rawLog.length}):`,
      ...rawLog.slice(-20),
    ].join('\n');

    return {
      detectedName,
      sdlMatch: sdlEntry?.name ?? null,
      inputApi: preset?.inputApi ?? 'unknown',
      vendorId,
      productId,
      hidReport,
    };
  }, [deviceKey]);
};

export { useDetectionContext };
export type { DetectionContext };
