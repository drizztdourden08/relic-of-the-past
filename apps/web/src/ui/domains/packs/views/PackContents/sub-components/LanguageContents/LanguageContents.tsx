/* @layer renderer-components @kind component */
/** A language pack's dialogue and variables, with the in-game box drawn in the set's own font. */
import { DialogueBrowser } from '../../../../language/compounds/DialogueBrowser';
import { readLanguagePack } from '../../behavior/read-language-pack';
import { usePackRead } from '../../behavior/usePackRead';
import { ContentsStatus } from '../ContentsStatus';
import type { PackSource } from '../../../../pack-source.type';

type LanguageContentsProps = {
  source: PackSource;
};

const LanguageContents = (props: LanguageContentsProps) => {
  const { source } = props;
  const { data, error } = usePackRead(source, readLanguagePack);

  if (!data) return <ContentsStatus error={error} />;
  return <DialogueBrowser set={data.set} font={data.font} />;
};

export { LanguageContents };
export type { LanguageContentsProps };
