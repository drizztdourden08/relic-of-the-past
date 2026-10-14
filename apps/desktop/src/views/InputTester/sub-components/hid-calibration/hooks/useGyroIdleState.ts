/* @layer renderer-components @kind hook */
import { useState } from 'react';
import type { GyroState, IdleState } from '../hid-calibration.type';

const useGyroIdleState = () => {
  const [gyroState, setGyroState] = useState<GyroState>('idle');
  const [idleState, setIdleState] = useState<IdleState>('idle');
  const [gyroExcluded, setGyroExcluded] = useState<Set<number>>(new Set());
  const [gyroChangedBytes, setGyroChangedBytes] = useState<Set<number>>(new Set());

  return { gyroState, setGyroState, idleState, setIdleState, gyroExcluded, setGyroExcluded, gyroChangedBytes, setGyroChangedBytes };
};

export { useGyroIdleState };
