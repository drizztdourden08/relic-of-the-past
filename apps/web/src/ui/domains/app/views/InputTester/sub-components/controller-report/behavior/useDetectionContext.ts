/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { recallControllerSdlType } from '@app/lib/input/controller-family-cache';
import { recallControllerName } from '@app/lib/input/controller-name-cache';
import { controllerInputStore } from '@app/lib/input/controller-input-store';

interface DetectionContext {
  detectedName: string;
  sdlMatch: string | null;
  inputApi: string;
  vendorId: string;
  productId: string;
  hidReport: string;
}

/** What the app knows about a device (remembered name, SDL type, recent raw HID traffic) for a report bundle. */
const useDetectionContext = (deviceKey: string): DetectionContext => {
  return useMemo(() => {
    const [vendorId = '0000', productId = '0000'] = deviceKey.split(':');
    const vendorIdNum = parseInt(vendorId, 16);
    const productIdNum = parseInt(productId, 16);
    const name = recallControllerName({ vendorId: vendorIdNum, productId: productIdNum });
    const sdlType = recallControllerSdlType(vendorIdNum, productIdNum);
    const detectedName = name ?? 'Unrecognized controller';
    const rawLog = controllerInputStore.getRawReportLog();

    const hidReport = [
      `deviceKey: ${deviceKey}`,
      `vendorId: ${vendorId}  productId: ${productId}`,
      `SDL type: ${sdlType ?? 'none (not seen this session)'}`,
      '',
      `Recent raw report log (last ${Math.min(rawLog.length, 20)} of ${rawLog.length}):`,
      ...rawLog.slice(-20),
    ].join('\n');

    return {
      detectedName,
      sdlMatch: sdlType,
      inputApi: 'hid',
      vendorId,
      productId,
      hidReport,
    };
  }, [deviceKey]);
};

export { useDetectionContext };
export type { DetectionContext };
