/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { WidgetId } from '@shared/types/widget-layout';

interface WidgetDockProps {
  /** Widget id to the content it shows. A widget with no content here is never drawn. */
  contents: Record<WidgetId, ReactNode>;
  /** The game core is running. Says nothing about what the user is looking at. */
  gameRunning: boolean;
  /** A full-window page is covering the game. A game-only widget steps aside for it,
   *  which is what Escape-to-home does, and no startup flag overrides that. */
  pageOpen: boolean;
  /** Master gate for `devOnly` widgets (Widget.constants.ts). Hides them entirely when off. */
  developerToolsEnabled: boolean;
  /** When true, `readsGameData` widgets render behind a DisabledOverlay, visible but inert. */
  vanillaSafe: boolean;
  /** Full settings snapshot, used to evaluate a widget's `requiresSetting` gate. */
  settings: GameSettings | null;
  /** Widget ids force-opened via the `--widgets=` startup flag, shown regardless of the
   *  no-game and dev-tools gates so the CLI-driven baselines work in a fresh profile. */
  startupForcedWidgetIds: string[];
  /** Deep-links to the setting responsible for a widget's lock, by its GameSettings key. */
  onOpenSettings: (settingId: string) => void;
}

/** What decides whether a widget is drawn at all. */
interface WidgetGates {
  gameRunning: boolean;
  pageOpen: boolean;
  developerToolsEnabled: boolean;
  forcedIds: string[];
  /** Ids the host has content for. */
  contentIds: WidgetId[];
}

export type { WidgetDockProps, WidgetGates };
