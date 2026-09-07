/* @layer electron-main @kind logic */
/**
 * Resolves an `app-debug-capture://captures/<profileId>/<sessionKey>/<file>` request to the
 * file a capture session wrote under profiles/<profileId>/debug-captures/<sessionKey>/. Same
 * shape as sprite-file-path.ts (the `captures` host is a label, unused programmatically): the
 * scheme is standard, so Chromium hands the path over percent-encoded with dot segments
 * already collapsed, decoded and re-encoded here as a proper file URL.
 */
import { join } from 'path';
import { pathToFileURL } from 'url';
import { CAPTURES_SUBDIR } from '../diagnostics/debug-report/finalize-capture-session';

/** `<profileId>/<sessionKey>/<file>` -> `<profileId>/debug-captures/<sessionKey>/<file>`. */
const captureRequestPath = (requestUrl: string): string => {
  const [profileId, sessionKey, ...rest] = decodeURIComponent(new URL(requestUrl).pathname.replace(/^\/+/, '')).split('/');
  return join(profileId, CAPTURES_SUBDIR, sessionKey, ...rest);
};

/** Absolute path of the requested file under `profilesRoot` (getUserDataPath('profiles')). */
const captureFilePathOf = (profilesRoot: string, requestUrl: string): string =>
  join(profilesRoot, captureRequestPath(requestUrl));

/** The same file as a `file:` URL for net.fetch. */
const captureFileUrlOf = (profilesRoot: string, requestUrl: string): string =>
  pathToFileURL(captureFilePathOf(profilesRoot, requestUrl)).href;

export { captureFilePathOf, captureFileUrlOf };
