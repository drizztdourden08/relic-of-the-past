/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { formatBytes } from '@drizztdourden08/brock-core';
import { Icon } from '@drizztdourden08/tessera/primitives';
import { extractionMeta } from './RomList.constants';
import type { ExtractionMetaProps } from './ExtractionMeta.type';

const ExtractionMeta = ({ rom }: ExtractionMetaProps) => {
  const t = useT();
  const { icon, label } = extractionMeta(t)[rom.extractionStatus];
  return (
    <>
      {icon && <Icon name={icon} inline />}
      {icon ? ` ${label}` : label}
      {rom.assetSize ? ` · ${formatBytes(rom.assetSize)}` : ''}
    </>
  );
};

export { ExtractionMeta };
