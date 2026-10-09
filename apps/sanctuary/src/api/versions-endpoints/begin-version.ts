/* @layer sanctuary-site @kind logic */
import type { BeginVersionBody } from '@shared/sanctuary/schemas/file-schemas';
import { sanctuaryApi } from '../sanctuary-client';
import type { VersionBeginResponse } from '../api-responses.type';

const beginVersion = (id: string, body: BeginVersionBody) =>
  sanctuaryApi.request<VersionBeginResponse>('fileVersionsBegin', { params: { id }, body });

export { beginVersion };
