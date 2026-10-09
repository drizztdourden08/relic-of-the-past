/* @layer site-kit @kind logic */
import type { Provider } from '@shared/hub/providers';
import { hubApi } from '../hub-client';

const unlinkProvider = (provider: Provider) => hubApi.request<void>('meUnlink', { params: { provider } });

export { unlinkProvider };
