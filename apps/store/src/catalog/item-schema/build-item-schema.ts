/* @layer store-site @kind logic */
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { FieldDescriptor } from '@drizztdourden08/tessera/data';
import type { ItemRow } from '../item-row.type';
import { ITEM_SCHEMA_CONFIG, SAMPLE_ROWS } from './item-schema.constants';

const buildItemSchema = (rows: readonly ItemRow[]): readonly FieldDescriptor[] =>
  buildSchema([...SAMPLE_ROWS, ...rows], ITEM_SCHEMA_CONFIG);

export { buildItemSchema };
