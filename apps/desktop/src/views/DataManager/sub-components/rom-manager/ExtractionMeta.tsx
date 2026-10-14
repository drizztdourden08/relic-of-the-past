/* @layer renderer-components @kind component */
import { formatBytes } from '@drizztdourden08/brock-core';
import { Icon } from '@drizztdourden08/tessera/primitives';
import { EXTRACTION_META } from './RomList.constants';
import type { ExtractionMetaProps } from './ExtractionMeta.type';

const ExtractionMeta = ({ rom }: ExtractionMetaProps) => {
  const { icon, label } = EXTRACTION_META[rom.extractionStatus];
  return (
    <>
      {icon && <Icon name={icon} inline />}
      {icon ? ` ${label}` : label}
      {rom.assetSize ? ` · ${formatBytes(rom.assetSize)}` : ''}
    </>
  );
};

export { ExtractionMeta };
