/* @layer website-site @kind component */
import { useMemo } from 'react';
import { detectPlatform } from '../../platform';
import { useLatestRelease } from '../../github';
import { RELEASES_PAGE_URL } from '../../repo';
import { DOWNLOAD_TEXT } from './DownloadButton.constants';
import { DownloadCta } from './sub-components/DownloadCta';
import { ReleaseDownload } from './sub-components/ReleaseDownload';

const DownloadButton = () => {
  const release = useLatestRelease();
  const platform = useMemo(detectPlatform, []);

  if (release.status === 'loading') return <DownloadCta busy title={DOWNLOAD_TEXT.checking} />;
  if (release.status === 'error') return <DownloadCta href={RELEASES_PAGE_URL} title={DOWNLOAD_TEXT.fromGitHub} />;
  return <ReleaseDownload release={release.data} platform={platform} />;
};

export { DownloadButton };
