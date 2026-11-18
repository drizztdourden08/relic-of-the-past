/* @layer renderer-lib @kind logic */
import type { IpcApi } from '@drizztdourden08/brock-core';
import { hostApi } from '@drizztdourden08/brock-react';

const tellMainLanguage = (tag: string): void => {
  const api: Partial<IpcApi> | null = hostApi();
  void api?.setAppLanguage?.(tag);
};

export { tellMainLanguage };
