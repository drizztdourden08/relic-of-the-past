/* @layer renderer-components @kind hook */
import { useContext } from 'react';
import { FormulaScopeContext } from './formula-scope-context';
import type { Scope } from './formula-scope.type';

const useInstanceScopes = (): readonly Scope[] => useContext(FormulaScopeContext);

export { useInstanceScopes };
