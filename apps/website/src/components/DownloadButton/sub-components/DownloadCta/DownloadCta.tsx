/* @layer website-site @kind component */
import { Box, Icon, Link, Small, Span } from '@drizztdourden08/tessera/primitives';
import { DOWNLOAD_ICON_SIZE } from '../../DownloadButton.constants';
import { PixelGradientBg } from '../PixelGradientBg';
import type { DownloadCtaProps } from './DownloadCta.type';

const DownloadCta = (props: DownloadCtaProps) => {
  const { href, busy = false, title, caption } = props;
  const content = (
    <>
      <PixelGradientBg />
      <Icon name="download" size={DOWNLOAD_ICON_SIZE} />
      <Span className="landing-download__label">
        {title}
        {caption && <Small className="landing-download__caption">{caption}</Small>}
      </Span>
    </>
  );

  if (!href) {
    return (
      <Box as="span" className="landing-download landing-download--loading" aria-busy={busy}>
        {content}
      </Box>
    );
  }
  return (
    <Link href={href} className="landing-download">
      {content}
    </Link>
  );
};

export { DownloadCta };
