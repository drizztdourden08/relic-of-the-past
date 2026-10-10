/* @layer store-site @kind entry */
import '@drizztdourden08/tessera/tokens.css';
import '@drizztdourden08/tessera/palettes/rotp.css';
import './theme.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TesseraProvider } from '@drizztdourden08/tessera/primitives';
import { TESSERA_OVERRIDES } from './main.constants';
import { SiteShell } from './views/SiteShell';

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element');

createRoot(root).render(
  <StrictMode>
    <TesseraProvider overrides={TESSERA_OVERRIDES}>
      <SiteShell />
    </TesseraProvider>
  </StrictMode>,
);
