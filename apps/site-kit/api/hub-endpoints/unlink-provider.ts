/* @layer site-kit @kind logic */
import type { Provider } from '@rotp/hub-contracts';
import { hubApi } from '../hub-client';

const unlinkProvider = (provider: Provider) => hubApi.request<void>('meUnlink', { params: { provider } });

export { unlinkProvider };
