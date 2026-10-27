/* @layer website-site @kind component */
import { Image, Link } from '../../design';
import { PUBLIC_FILE_RATIOS, PUBLIC_FILES, publicFileUrl } from '../../public-file';
import { LEGAL_HEADER_TEXT } from './LegalHeader.constants';
import './LegalHeader.css';

const LegalHeader = () => (
  <Link href={publicFileUrl('')} className="legal-header" aria-label={LEGAL_HEADER_TEXT.homeLabel}>
    <Image
      className="legal-header__mark"
      src={publicFileUrl(PUBLIC_FILES.mark)}
      alt=""
      aspectRatio={PUBLIC_FILE_RATIOS.mark}
      fit="contain"
      pixelated
    />
    <Image
      className="legal-header__wordmark"
      src={publicFileUrl(PUBLIC_FILES.wordmark)}
      alt=""
      aspectRatio={PUBLIC_FILE_RATIOS.wordmark}
      fit="contain"
    />
  </Link>
);

export { LegalHeader };
