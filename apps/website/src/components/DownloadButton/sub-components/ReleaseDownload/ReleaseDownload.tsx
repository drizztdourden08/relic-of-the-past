/* @layer website-site @kind component */
import { Flex } from '@drizztdourden08/tessera/primitives';
import { pickAssets, variantLabel } from '../../../../downloads';
import { formatBytes } from '../../../../format';
import { PLATFORM_LABELS } from '../../../../platform';
import { DOWNLOAD_TEXT } from '../../DownloadButton.constants';
import { DownloadCta } from '../DownloadCta';
import { DownloadVariants } from '../DownloadVariants';
import type { ReleaseDownloadProps } from './ReleaseDownload.type';

const ReleaseDownload = (props: ReleaseDownloadProps) => {
  const { release, platform } = props;
  const [primary, ...variants] = pickAssets(release.assets, platform);

  if (!primary) {
    return (
      <DownloadCta
        href={release.html_url}
        title={`${DOWNLOAD_TEXT.getRelease} ${release.tag_name}`}
        caption={`${DOWNLOAD_TEXT.viewDownloads} ${PLATFORM_LABELS[platform]}`}
      />
    );
  }

  const caption = `${release.tag_name} / ${variantLabel(primary.name)} / ${formatBytes(primary.size)}`;

  return (
    <Flex direction="column" gap="md" className="landing-download-stack">
      <DownloadCta
        href={primary.browser_download_url}
        title={`${DOWNLOAD_TEXT.downloadFor} ${PLATFORM_LABELS[platform]}`}
        caption={caption}
      />
      <DownloadVariants assets={variants} />
    </Flex>
  );
};

export { ReleaseDownload };
