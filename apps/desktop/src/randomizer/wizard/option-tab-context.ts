/* @layer renderer-components @kind context */
import { createContext } from 'react';
import type { OptionTabControl } from './option-tab-context.type';

const OptionTabContext = createContext<OptionTabControl | null>(null);

export { OptionTabContext };
