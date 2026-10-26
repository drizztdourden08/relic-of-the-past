/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { recallControllerSdlType, recallControllerName } from '@drizztdourden08/brock-input/renderer';
import { controllerInputStore } from '@drizztdourden08/brock-input/renderer';
import { RAW_LOG_TAIL } from '../controller-report.constants';
import type { DetectionContext } from '@drizztdourden08/brock-input/renderer';

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
      `Recent raw report log (last ${Math.min(rawLog.length, RAW_LOG_TAIL)} of ${rawLog.length}):`,
      ...rawLog.slice(-RAW_LOG_TAIL),
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
