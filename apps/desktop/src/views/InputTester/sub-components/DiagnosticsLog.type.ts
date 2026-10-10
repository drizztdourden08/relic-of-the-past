/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { EventEntry } from './input-calibration.type';

interface DiagnosticsLogProps {
  events: EventEntry[];
  controllerDiag: string[];
  logRef: RefObject<HTMLDivElement | null>;
}

export type { DiagnosticsLogProps };
