/* @layer renderer-appshell @kind component */
import { AppMain } from '../ui/domains/app/views/AppMain';
import { TesseraRoot } from './tessera-root/TesseraRoot';

const App = () => (
  <TesseraRoot>
    <AppMain />
  </TesseraRoot>
);

export { App };
