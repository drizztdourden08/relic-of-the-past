/* @layer shared-input @kind types */
import type { HapticEventType } from './haptic-events.constants';

type HapticEventTypeValue = (typeof HapticEventType)[keyof typeof HapticEventType];

export type { HapticEventTypeValue };
