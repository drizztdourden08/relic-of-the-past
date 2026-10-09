/* @layer electron-main @kind logic */
import { FEED_OWNER, FEED_REPO } from './updater.constants';

const releasePageUrl = (version?: string): string => {
  const base = `https://github.com/${FEED_OWNER}/${FEED_REPO}/releases`;
  return version ? `${base}/tag/v${version}` : `${base}/latest`;
};

export { releasePageUrl };
