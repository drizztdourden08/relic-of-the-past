/* @layer electron-main @kind logic */
import { join } from 'path';
import { pathToFileURL } from 'url';
import { CAPTURES_SUBDIR } from '../diagnostics/debug-report/finalize-capture-session';

const captureRequestPath = (requestUrl: string): string => {
  const [profileId, sessionKey, ...rest] = decodeURIComponent(new URL(requestUrl).pathname.replace(/^\/+/, '')).split('/');
  if (profileId === undefined || sessionKey === undefined) throw new TypeError(`capture request has no profile and session: ${requestUrl}`);
  return join(profileId, CAPTURES_SUBDIR, sessionKey, ...rest);
};

const captureFilePathOf = (profilesRoot: string, requestUrl: string): string =>
  join(profilesRoot, captureRequestPath(requestUrl));

const captureFileUrlOf = (profilesRoot: string, requestUrl: string): string =>
  pathToFileURL(captureFilePathOf(profilesRoot, requestUrl)).href;

export { captureFileUrlOf };
