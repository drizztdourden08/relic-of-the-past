/* @layer renderer-components @kind component */
import { DialogueBrowser } from '../../../../packs/language/compounds/DialogueBrowser';
import { readLanguagePack } from '../../behavior/read-language-pack';
import { usePackRead } from '../../behavior/usePackRead';
import { ContentsStatus } from '../ContentsStatus';
import type { PackSourceProps } from '../../PackContents.type';

const LanguageContents = (props: PackSourceProps) => {
  const { source } = props;
  const { data, error } = usePackRead(source, readLanguagePack);

  if (!data) return <ContentsStatus error={error} />;
  return <DialogueBrowser set={data.set} font={data.font} />;
};

export { LanguageContents };
