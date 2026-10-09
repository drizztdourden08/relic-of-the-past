/* @layer renderer-appshell @kind component */
import type { ReactNode } from 'react';
import { TesseraProvider } from '@drizztdourden08/tessera/primitives';
import { ToastStack } from '@drizztdourden08/tessera/composites';
import { ViewStorageProvider } from '@drizztdourden08/tessera/data';
import { ELECTRON_VIEW_STORAGE, TESSERA_OVERRIDES } from './tessera-root.constants';

const TesseraRoot = ({ children }: { children: ReactNode }) => (
  <TesseraProvider overrides={TESSERA_OVERRIDES}>
    <ViewStorageProvider value={ELECTRON_VIEW_STORAGE}>
      {children}
      <ToastStack />
    </ViewStorageProvider>
  </TesseraProvider>
);

export { TesseraRoot };
