/* @layer renderer-app @kind data */
import type { SchemaConfig } from '@ds/data';

const TAG_CONFIG: SchemaConfig = {
  defaultColumns: ['id', 'namespace', 'value', 'label', 'appliesTo'],
  order: ['id', 'namespace', 'value', 'name', 'label', 'namespaceLabel', 'appliesTo'],
  labels: { name: 'Key', value: 'Term', namespaceLabel: 'Namespace label' },
  groups: [
    { id: 'hierarchy', label: 'Hierarchy', paths: ['id', 'namespace', 'value', 'name'] },
    { id: 'display', label: 'Display', paths: ['label', 'namespaceLabel'] },
    { id: 'scope', label: 'Scope', paths: ['appliesTo'] },
  ],
};

export { TAG_CONFIG };
