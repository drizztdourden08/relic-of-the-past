/* @layer website-site @kind component */
import { Flex, Icon, Link } from '../../../../design';
import { variantLabel } from '../../../../downloads';
import { formatBytes } from '../../../../format';
import { DOWNLOAD_ICON_SIZE } from '../../DownloadButton.constants';
import type { DownloadVariantsProps } from './DownloadVariants.type';

const DownloadVariants = (props: DownloadVariantsProps) => {
  const { assets } = props;
  if (assets.length === 0) return null;

  return (
    <Flex wrap gap="sm" className="landing-download-variants">
      {assets.map((asset) => (
        <Link key={asset.name} href={asset.browser_download_url} className="landing-download-variant">
          <Icon name="download" size={DOWNLOAD_ICON_SIZE} />
          {`${variantLabel(asset.name)} / ${formatBytes(asset.size)}`}
        </Link>
      ))}
    </Flex>
  );
};

export { DownloadVariants };
