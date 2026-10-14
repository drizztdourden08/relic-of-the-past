/* @layer renderer-components @kind hook */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { applyVidPid } from '../apply-vid-pid';
import type { UseCalibrationBootstrapParams } from './hid-calibration-hook.type';

const useCalibrationBootstrap = (params: UseCalibrationBootstrapParams) => {
  const { phase, deviceKey, detectedProfile, handleProfileConfirm, deviceInfoRef } = params;
  const autoConfirmedRef = useRef(false);

  useLayoutEffect(() => {
    if (autoConfirmedRef.current || phase !== 'select-profile' || !detectedProfile) return;
    autoConfirmedRef.current = true;
    handleProfileConfirm();
  }, [phase, detectedProfile, handleProfileConfirm]);

  useEffect(() => {
    if (phase === 'live' && deviceKey) applyVidPid(deviceInfoRef, deviceKey);
  }, [phase, deviceKey]);
};

export { useCalibrationBootstrap };
