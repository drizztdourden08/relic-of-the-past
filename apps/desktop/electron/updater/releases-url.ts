/* @layer electron-main @kind logic */
import { API_ORIGIN, FEED_OWNER, FEED_REPO } from './updater.constants';

const releasesUrl = (perPage: number): string =>
  `${API_ORIGIN}/repos/${FEED_OWNER}/${FEED_REPO}/releases?per_page=${perPage}`;

export { releasesUrl };
