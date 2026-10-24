/* @layer renderer-components @kind logic */
import type { ScreenParams } from '@drizztdourden08/brock-react';
import { PAD_PARAM } from '../ControllerDiagnostics.constants';

const padParamOf = (params: ScreenParams): string | null => {
  const value = params[PAD_PARAM];
  return typeof value === 'string' ? value : null;
};

export { padParamOf };
