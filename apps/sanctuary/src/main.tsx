/* @layer sanctuary-site @kind component */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@drizztdourden08/tessera/tokens.css';
import './site.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
