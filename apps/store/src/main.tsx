/* @layer store-site @kind component */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TesseraProvider } from '@drizztdourden08/tessera/primitives';
import '@drizztdourden08/tessera/tokens.css';
import '@drizztdourden08/tessera/palettes/rotp.css';
import '@app/theme.css';
import './site.css';
import { App } from './App';
import { SITE_TESSERA_OVERRIDES } from './site/tessera-overrides.constants';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <TesseraProvider overrides={SITE_TESSERA_OVERRIDES}>
      <App />
    </TesseraProvider>
  </StrictMode>,
);
