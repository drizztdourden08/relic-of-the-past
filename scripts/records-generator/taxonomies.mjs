/* @layer tooling-scripts @kind build */
import path from 'node:path';
import { generatedHeader } from './generated-header.mjs';

const TAXONOMIES = [
  {
    base: 'packages/game-data/src/data/taxonomy/screen-tags',
    appliesTo: 'screen',
    union: 'ScreenTag',
    namespaceUnion: 'TagNamespace',
    metadataType: 'TagMetadata',
    metadata: 'TAG_METADATA',
    namespaces: 'TAG_NAMESPACES',
    groups: { env: 'EnvironmentTag', role: 'RoleTag', hazard: 'HazardTag', loot: 'LootTag', traverse: 'TraversalTag' },
  },
  {
    base: 'packages/game-data/src/data/taxonomy/connection-tags',
    appliesTo: 'connection',
    union: 'ConnectionTag',
    namespaceUnion: 'ConnectionTagNamespace',
    metadataType: 'ConnectionTagMetadata',
    metadata: 'CONNECTION_TAG_METADATA',
    namespaces: 'CONNECTION_TAG_NAMESPACES',
    groups: { transit: 'TransitTag', barrier: 'BarrierTag', ctx: 'ContextTag' },
  },
  {
    base: 'packages/game-data/src/data/taxonomy/check-content-tags',
    appliesTo: 'check',
    union: 'ContentTag',
    metadataType: 'ContentTagMetadata',
    metadata: 'CONTENT_TAG_METADATA',
    namespaces: 'CONTENT_TAG_NAMESPACES',
    groups: {},
  },
];

const quoted = (value) => `'${value}'`;
const unionOf = (values) => values.map(quoted).join(' | ');

const wrapped = (text, prefix, width = 98) => {
  const lines = [];
  let line = prefix;
  for (const word of text.split(' ')) {
    if (line === prefix) { line = `${prefix}${word}`; continue; }
    if (`${line} ${word}`.length > width) { lines.push(line); line = `${prefix}${word}`; continue; }
    line = `${line} ${word}`;
  }
  lines.push(line);
  return lines.join('\n');
};

const wrappedUnion = (name, values) => {
  const oneLine = `type ${name} = ${unionOf(values)};`;
  if (oneLine.length <= 110) return oneLine;
  const parts = [];
  let line = '';
  for (const value of values) {
    const next = line === '' ? quoted(value) : `${line} | ${quoted(value)}`;
    if (next.length > 90) { parts.push(line); line = quoted(value); continue; }
    line = next;
  }
  parts.push(line);
  return `type ${name} =\n${parts.map((part) => `  | ${part}`).join('\n')};`;
};

const namespacesOf = (spec, tags) => {
  const namespaceLabels = new Map();
  const valuesByNamespace = new Map();
  for (const tag of tags) {
    if (!namespaceLabels.has(tag.namespace)) namespaceLabels.set(tag.namespace, tag.namespaceLabel);
    valuesByNamespace.set(tag.namespace, [...(valuesByNamespace.get(tag.namespace) ?? []), tag.name]);
  }
  const namespaceIds = [...namespaceLabels.keys()];
  const missing = namespaceIds.filter((id) => spec.groups[id] === undefined);
  if (Object.keys(spec.groups).length > 0 && missing.length > 0) {
    throw new Error(`generate: ${spec.base} has no sub-union name for namespace ${missing.join(', ')}`);
  }
  return { namespaceLabels, valuesByNamespace, namespaceIds };
};

const unionBlocks = (spec, tags, { valuesByNamespace, namespaceIds }) => {
  if (Object.keys(spec.groups).length === 0) return [wrappedUnion(spec.union, tags.map((tag) => tag.name))];
  return [
    ...namespaceIds.map((id) => wrappedUnion(spec.groups[id], valuesByNamespace.get(id))),
    `type ${spec.union} = ${namespaceIds.map((id) => spec.groups[id]).join(' | ')};`,
  ];
};

const typeExportBlock = (spec, namespaceIds) => {
  const typeExports = [
    spec.union, spec.metadataType, spec.namespaceUnion,
    ...namespaceIds.map((id) => spec.groups[id]),
  ].filter(Boolean).sort();
  const typeExportLine = `export type { ${typeExports.join(', ')} };`;
  return typeExportLine.length <= 98 ? typeExportLine : `export type {\n${wrapped(typeExports.join(', '), '  ')},\n};`;
};

const typeSourceOf = (spec, tags, namespaces, namespaceType) => {
  const blocks = unionBlocks(spec, tags, namespaces);
  if (spec.namespaceUnion) blocks.push(wrappedUnion(spec.namespaceUnion, namespaces.namespaceIds));
  blocks.push(`interface ${spec.metadataType} {
  id: ${spec.union};
  label: string;
  namespace: ${namespaceType};
}`);
  return `${generatedHeader('shared-game', 'types')}
${blocks.join('\n\n')}

${typeExportBlock(spec, namespaces.namespaceIds)}
`;
};

const dataSourceOf = (spec, tags, { namespaceLabels, namespaceIds }, namespaceType) => {
  const tables = [
    `const ${spec.namespaces}: { id: ${namespaceType}; label: string }[] = [
${namespaceIds.map((id) => `  { id: ${quoted(id)}, label: ${quoted(namespaceLabels.get(id))} },`).join('\n')}
];`,
    `const ${spec.metadata}: ${spec.metadataType}[] = [
${tags.map((tag) => `  { id: ${quoted(tag.name)}, label: ${quoted(tag.label)}, namespace: ${quoted(tag.namespace)} },`).join('\n')}
];`,
  ];
  const typeImports = [spec.metadataType, spec.namespaceUnion].filter(Boolean).sort().join(', ');
  return `${generatedHeader('shared-game', 'data')}import type { ${typeImports} } from './${path.basename(spec.base)}.type';

${tables.join('\n\n')}

export { ${[spec.metadata, spec.namespaces].sort().join(', ')} };
`;
};

const buildTaxonomy = (spec, data) => {
  const tags = data.all('tag').filter((tag) => tag.appliesTo.includes(spec.appliesTo));
  if (tags.length === 0) throw new Error(`generate: no tag records apply to ${spec.appliesTo}`);
  const namespaces = namespacesOf(spec, tags);
  const namespaceType = spec.namespaceUnion ?? quoted(namespaces.namespaceIds[0]);
  return {
    typeSource: typeSourceOf(spec, tags, namespaces, namespaceType),
    dataSource: dataSourceOf(spec, tags, namespaces, namespaceType),
  };
};

const taxonomyTargets = (data) => TAXONOMIES.flatMap((spec) => {
  const { typeSource, dataSource } = buildTaxonomy(spec, data);
  return [
    { path: `${spec.base}.type.ts`, content: typeSource },
    { path: `${spec.base}.constants.ts`, content: dataSource },
  ];
});

export { taxonomyTargets };
