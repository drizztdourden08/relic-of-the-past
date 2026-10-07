/* @layer renderer-components @kind logic */
/**
 * How a SettingsLayout presents itself, supplied by the screen that hosts the
 * tab. `page` draws the tab as a full SettingsPage (header, anchors, own
 * scroll). `results` draws only the rows matching `query`, bare, so a search
 * pane can stack every tab's matches with their real controls.
 */
import { createContext, type ReactNode } from 'react';

interface SettingsPageContextValue {
  variant: 'page' | 'results';
  icon: ReactNode;
  title: string;
  /** The scene behind a page's header. */
  backdrop?: ReactNode;
  /** Lowercased, trimmed; empty shows every row. */
  query: string;
}

const SettingsPageContext = createContext<SettingsPageContextValue | null>(null);

export { SettingsPageContext };
export type { SettingsPageContextValue };
