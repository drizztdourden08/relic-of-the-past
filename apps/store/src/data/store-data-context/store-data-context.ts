/* @layer store-site @kind logic */
import { createContext } from 'react';
import type { StoreData } from './store-data-context.type';

const StoreDataContext = createContext<StoreData | null>(null);

export { StoreDataContext };
