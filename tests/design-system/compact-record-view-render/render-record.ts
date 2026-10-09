/* @layer tests @kind helper */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CompactRecordView } from '../../../apps/web/src/ui/design-system/composites/CompactRecordView';
import type { FieldDescriptor } from '../../../apps/web/src/ui/design-system/data/schema/field-descriptor';

const renderRecord = (record: unknown, schema: readonly FieldDescriptor[], groups?: readonly string[]): string =>
  renderToStaticMarkup(createElement(CompactRecordView, { record, schema, groups }));

export { renderRecord };
