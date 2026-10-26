/* @layer website-site @kind component */
import { Flex, Icon, Link } from '@drizztdourden08/tessera/primitives';
import { variantLabel } from '../../../../downloads';
import { formatBytes } from '../../../../format';
import { ICON_PATHS, ICON_SIZE } from '../../../../icons';
import type { DownloadVariantsProps } from './DownloadVariants.type';

const DownloadVariants = (props: DownloadVariantsProps) => {
  const { assets } = props;
  if (assets.length === 0) return null;

  return (
    <Flex wrap gap="sm" className="landing-download-variants">
      {assets.map((asset) => (
        <Link key={asset.name} href={asset.browser_download_url} className="landing-download-variant">
          <Icon path={ICON_PATHS.download} size={ICON_SIZE} />
          {`${variantLabel(asset.name)} / ${formatBytes(asset.size)}`}
        </Link>
      ))}
    </Flex>
  );
};

export { DownloadVariants };
