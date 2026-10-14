/* @layer renderer-components @kind logic */
import { codeInfoFor } from '@rotp/languages';
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

const descriptionOf = (attrs: DialogueTokenAttrs, label: string, info: CodeInfo | null): string =>
  attrs.kind === 'ref'
    ? `glossary term ${label}`
    : `${label}${info?.description ? `, ${info.description}` : ''}`;

const atomFactsOf = (attrs: DialogueTokenAttrs): AtomFacts => {
  const name = codeNameOf(attrs);
  const info = name === null ? null : codeInfoFor(name);
  const label = labelOf(attrs, name, info);
  return {
    name,
    label,
    description: descriptionOf(attrs, label, info),
    icon: name === null ? GLOSSARY_ICON : iconForCodeName(name),
    value: valueOf(attrs),
  };
};

export { atomFactsOf };
