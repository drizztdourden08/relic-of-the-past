/* @layer tests @kind helper */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CompactRecordView } from '@drizztdourden08/tessera/composites';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';

const renderRecord = (record: unknown, schema: readonly FieldDescriptor[], groups?: readonly string[]): string =>
  renderToStaticMarkup(createElement(CompactRecordView, { record, schema, groups }));

export { renderRecord };
