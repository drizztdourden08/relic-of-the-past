/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';

const deleteView = (id: string) => hubApi.request<{ ok: true }>('viewsDelete', { params: { id } });

export { deleteView };
