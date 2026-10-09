/* @layer renderer-components @kind types */
type ArmedAction = 'load' | 'save';

type ArmedState = { action: ArmedAction; key: string };

type UseArmedActionParams = {
  timeoutMs: number;
  resetKey: string;
};

export type { ArmedAction, ArmedState, UseArmedActionParams };
