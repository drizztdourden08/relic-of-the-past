/* @layer site-kit @kind logic */
import { hubApi } from '../hub-client';

const deleteGroup = (id: string) => hubApi.request<{ ok: true }>('groupsDelete', { params: { id } });

export { deleteGroup };
