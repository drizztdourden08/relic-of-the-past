/* @layer tests @kind type */
import type { Page } from 'playwright';
import type { AnnotationRow, CheckSummary } from '../state-readers';

interface StateReader {
  window: Page;
  enableKeyboard: () => Promise<void>;
  states: () => Promise<string[]>;
  awaitState: (match: RegExp, timeoutMs?: number) => Promise<string>;
  flood: () => Promise<{ reachable: number; total: number }>;
  groups: () => Promise<Record<string, number>>;
  rows: () => Promise<AnnotationRow[]>;
  tags: () => Promise<string[]>;
  checkSummary: () => Promise<CheckSummary>;
  screenId: () => Promise<string>;
  press: (button: string, holdMs?: number) => Promise<void>;
}

interface PageInputManager {
  keyboardMap: Map<string, string>;
  allowed: { keyboard: boolean };
}

declare global {
  interface Window {
    __inputManager?: PageInputManager;
  }
}

export type { PageInputManager, StateReader };
