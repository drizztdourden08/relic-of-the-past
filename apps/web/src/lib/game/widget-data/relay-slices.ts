/* @layer bridge-wasm @kind types */
/**
 * The pieces of state the main window sends to a widget's own window, one
 * kind each. The ids travel as plain arrays, the sets are rebuilt on arrival.
 */
import type { CheckId, ItemId } from '@shared/game/data';
import type { GameSettings } from '@shared/types/settings';
import type { WidgetFrame, WidgetId } from '@shared/types/widget-layout';
import type { LogEntry } from '../../log-bus';

type RelaySlice =
  | { kind: 'inventory'; data: ItemId[] }
  | { kind: 'completedChecks'; data: CheckId[] }
  | { kind: 'log'; data: LogEntry }
  | { kind: 'logs'; data: LogEntry[] }
  | { kind: 'settings'; data: GameSettings }
  | { kind: 'profile'; data: { profileId: string | null } }
  | { kind: 'game'; data: { running: boolean } }
  | { kind: 'frames'; data: Partial<Record<WidgetId, WidgetFrame>> };

export type { RelaySlice };
