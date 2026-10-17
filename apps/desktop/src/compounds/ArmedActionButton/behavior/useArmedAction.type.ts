/* @layer renderer-components @kind types */
type ArmedAction = 'load' | 'save' | 'delete';

type ArmedState = { action: ArmedAction; key: string };

type UseArmedActionParams = {
  resetKey: string;
};

export type { ArmedAction, ArmedState, UseArmedActionParams };
