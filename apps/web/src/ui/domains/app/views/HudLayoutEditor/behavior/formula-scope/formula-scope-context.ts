/* @layer renderer-components @kind logic */
import { createContext } from 'react';
import type { Scope } from './formula-scope.type';

const FormulaScopeContext = createContext<readonly Scope[]>([]);

export { FormulaScopeContext };
