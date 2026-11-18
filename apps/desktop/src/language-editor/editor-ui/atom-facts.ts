/* @layer renderer-components @kind logic */
import { codeInfoFor } from '@rotp/languages';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { DialogueTokenAttrs } from './editor-contract';
import { iconForCodeName, GLOSSARY_ICON } from './icon-for-token';
import type { AtomFacts, CodeInfo } from './TokenAtom.type';

const codeNameOf = (attrs: DialogueTokenAttrs): string | null => {
  if (attrs.kind === 'break') return String(attrs.row);
  if (attrs.kind === 'var') return attrs.name === 'player-name' ? 'Name' : 'Number';
  if (attrs.kind === 'cmd') return attrs.name;
  return null;
};

const valueOf = (attrs: DialogueTokenAttrs): number | null => {
  if (attrs.kind === 'cmd') return attrs.param;
  if (attrs.kind === 'var') return attrs.slot;
  return null;
};

const labelOf = (attrs: DialogueTokenAttrs, name: string | null, info: CodeInfo | null): string =>
  attrs.kind === 'ref' ? (attrs.key ?? '') : (info?.label ?? name ?? '');

const descriptionOf = (t: I18n['t'], attrs: DialogueTokenAttrs, label: string, info: CodeInfo | null): string =>
  attrs.kind === 'ref'
    ? t('language-editor:atom.glossary-term', { label })
    : info?.description
      ? t('language-editor:atom.described', { label, description: info.description })
      : label;

const atomFactsOf = (t: I18n['t'], attrs: DialogueTokenAttrs): AtomFacts => {
  const name = codeNameOf(attrs);
  const info = name === null ? null : codeInfoFor(name);
  const label = labelOf(attrs, name, info);
  return {
    name,
    label,
    description: descriptionOf(t, attrs, label, info),
    icon: name === null ? GLOSSARY_ICON : iconForCodeName(name),
    value: valueOf(attrs),
  };
};

export { atomFactsOf };
