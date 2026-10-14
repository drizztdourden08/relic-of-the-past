/* @layer renderer-components @kind hook */
import { useState } from 'react';
import type { StickSide, TriggerSide } from '../hid-calibration.type';

const useStickTriggerState = () => {
  const [activeStick, setActiveStick] = useState<StickSide | null>(null);
  const [stickBusy, setStickBusy] = useState(false);
  const [stickLiveInfo, setStickLiveInfo] = useState('');
  const [stickPickMode, setStickPickMode] = useState(false);
  const [stickPickedBytes, setStickPickedBytes] = useState<number[]>([]);
  const [activeTrigger, setActiveTrigger] = useState<TriggerSide | null>(null);
  const [triggerBusy, setTriggerBusy] = useState(false);
  const [triggerLiveInfo, setTriggerLiveInfo] = useState('');
  const [triggerPickMode, setTriggerPickMode] = useState(false);
  const [triggerPickedByte, setTriggerPickedByte] = useState<number | null>(null);

  return {
    activeStick, setActiveStick, stickBusy, setStickBusy, stickLiveInfo, setStickLiveInfo,
    stickPickMode, setStickPickMode, stickPickedBytes, setStickPickedBytes,
    activeTrigger, setActiveTrigger, triggerBusy, setTriggerBusy, triggerLiveInfo, setTriggerLiveInfo,
    triggerPickMode, setTriggerPickMode, triggerPickedByte, setTriggerPickedByte,
  };
};

export { useStickTriggerState };
