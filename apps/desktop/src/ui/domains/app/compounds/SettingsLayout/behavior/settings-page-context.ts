/* @layer renderer-components @kind logic */
import { createContext } from 'react';
import type { SettingsPageContextValue } from '../SettingsLayout.type';

const SettingsPageContext = createContext<SettingsPageContextValue | null>(null);

export { SettingsPageContext };
export type { SettingsPageContextValue };
